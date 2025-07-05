const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected successfully!',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1 AND password_hash = $2', [username, password]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = userResult.rows[0];
    // Fetch cards
    const cardsResult = await pool.query('SELECT * FROM cards WHERE user_id = $1', [user.id]);
    // Fetch transactions for all cards
    const cardIds = cardsResult.rows.map(card => card.id);
    let transactions = [];
    if (cardIds.length > 0) {
      const txResult = await pool.query('SELECT * FROM transactions WHERE card_id = ANY($1::int[])', [cardIds]);
      transactions = txResult.rows;
    }
    res.json({
      user: { id: user.id, username: user.username },
      cards: cardsResult.rows,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Get cards for a user (by user_id query param for demo)
app.get('/api/cards', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });
  try {
    const cardsResult = await pool.query('SELECT * FROM cards WHERE user_id = $1', [userId]);
    res.json(cardsResult.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cards', details: err.message });
  }
});

// Get transactions for a user (by user_id query param for demo)
app.get('/api/transactions', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });
  try {
    const cardsResult = await pool.query('SELECT id FROM cards WHERE user_id = $1', [userId]);
    const cardIds = cardsResult.rows.map(card => card.id);
    let transactions = [];
    if (cardIds.length > 0) {
      const txResult = await pool.query('SELECT * FROM transactions WHERE card_id = ANY($1::int[])', [cardIds]);
      transactions = txResult.rows;
    }
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
});

// Add new card for a user
app.post('/api/cards', async (req, res) => {
  const { user_id, number, holder, expiry } = req.body;
  if (!user_id || !number || !holder || !expiry) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO cards (user_id, number, holder, expiry, balance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, number, holder, expiry, 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add card', details: err.message });
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Top up card balance
app.post('/api/cards/topup', async (req, res) => {
  console.log('Top-up request received:', req.body);
  const { card_id, amount } = req.body;
  
  if (!card_id || !amount) {
    console.log('Missing required fields:', { card_id, amount });
    return res.status(400).json({ error: 'Missing card_id or amount' });
  }
  
  try {
    // Check if card exists first
    const cardCheck = await pool.query('SELECT * FROM cards WHERE id = $1', [card_id]);
    if (cardCheck.rows.length === 0) {
      console.log('Card not found:', card_id);
      return res.status(404).json({ error: 'Card not found' });
    }
    
    console.log('Updating card balance:', { card_id, current_balance: cardCheck.rows[0].balance, amount });
    
    // Update card balance
    const updateResult = await pool.query(
      'UPDATE cards SET balance = balance + $1 WHERE id = $2 RETURNING *',
      [amount, card_id]
    );
    
    console.log('Card updated:', updateResult.rows[0]);
    
    // Insert a transaction record
    const transactionResult = await pool.query(
      'INSERT INTO transactions (card_id, name, time, amount, type) VALUES ($1, $2, NOW(), $3, $4) RETURNING *',
      [card_id, 'Top-up', amount, 'income']
    );
    
    console.log('Transaction created:', transactionResult.rows[0]);
    
    res.json({ 
      success: true, 
      updated_card: updateResult.rows[0],
      transaction: transactionResult.rows[0]
    });
  } catch (err) {
    console.error('Top-up error:', err);
    res.status(500).json({ error: 'Top up failed', details: err.message });
  }
});

// Deduct from card balance (for sending money)
app.post('/api/cards/deduct', async (req, res) => {
  console.log('Deduct request received:', req.body);
  const { card_id, amount } = req.body;

  if (!card_id || !amount) {
    console.log('Missing required fields:', { card_id, amount });
    return res.status(400).json({ error: 'Missing card_id or amount' });
  }

  try {
    // Atomic update: only deduct if balance is sufficient
    const updateResult = await pool.query(
      `UPDATE cards
       SET balance = balance - $1
       WHERE id = $2 AND balance >= $1
       RETURNING *`,
      [amount, card_id]
    );

    if (updateResult.rows.length === 0) {
      // Not enough balance
      console.log('Insufficient balance for atomic update');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    console.log('Card updated:', updateResult.rows[0]);

    res.json({
      success: true,
      updated_card: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Deduct error:', err);
    res.status(500).json({ error: 'Deduct failed', details: err.message });
  }
});

// Add transaction record
app.post('/api/transactions', async (req, res) => {
  console.log('Transaction request received:', req.body);
  const { user_id, card_id, name, amount, type } = req.body;
  // Ignore any 'time' sent from frontend
  if (!card_id || !name || amount === undefined || !type) {
    console.log('Missing required fields:', { card_id, name, amount, type });
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const transactionResult = await pool.query(
      'INSERT INTO transactions (card_id, name, time, amount, type) VALUES ($1, $2, NOW(), $3, $4) RETURNING *',
      [card_id, name, amount, type]
    );
    console.log('Transaction created:', transactionResult.rows[0]);
    res.status(201).json(transactionResult.rows[0]);
  } catch (err) {
    console.error('Transaction creation error:', err);
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
});

// Get user details by user ID
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// Split Bill endpoint
app.post('/api/split-bill', async (req, res) => {
  const { payer, payerEmail, amount, friends, message, cardId } = req.body;
  if (!payer || !payerEmail || !amount || !Array.isArray(friends) || friends.length === 0 || !cardId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Deduct total bill amount from selected card
    const deductResult = await pool.query(
      `UPDATE cards SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING *`,
      [amount, cardId]
    );
    if (deductResult.rows.length === 0) {
      return res.status(400).json({ error: 'Insufficient balance on selected card' });
    }
    // Add transaction for full bill amount
    await pool.query(
      'INSERT INTO transactions (card_id, name, time, amount, type) VALUES ($1, $2, NOW(), $3, $4)',
      [cardId, 'Split Bill Payment', -Math.abs(amount), 'expense']
    );
    // Calculate split amount (include payer)
    const totalPeople = friends.length + 1;
    const splitAmount = (amount / totalPeople).toFixed(2);
    // Generate QR code data
    const qrData = JSON.stringify({
      payer,
      payerEmail,
      amount: splitAmount,
      message: message || 'Split bill payment'
    });
    // Generate QR code as data URL
    const qrImage = await QRCode.toDataURL(qrData);
    // Set up nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    // Send email to each friend
    for (const friend of friends) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: friend.email,
        subject: `Split Bill Request from ${payer}`,
        text: `${payer} has split a bill with you. Your share is $${splitAmount}. Message: ${message || 'Split bill payment'}`,
        attachments: [
          {
            filename: 'split-bill-qr.png',
            content: qrImage.split(',')[1],
            encoding: 'base64',
            contentType: 'image/png'
          }
        ]
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send email to', friend.email, emailErr);
        return res.status(500).json({ error: `Failed to send email to ${friend.email}`, details: emailErr.message });
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Split bill error:', err);
    res.status(500).json({ error: 'Failed to process split bill', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API: http://localhost:${PORT}/api/test-db`);
}); 