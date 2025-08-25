const pool = require('./db');

const DEFAULT_USERS = [
  {
    username: 'Alex',
    password: 'password1',
    data: {
      name: 'Alex',
      balance: 2458.3,
      cards: [
        { id: 1, number: '**** **** **** 4289', holder: 'Alex Johnson', expiry: '09/25', primary: true },
        { id: 2, number: '**** **** **** 7632', holder: 'Alex Johnson', expiry: '11/26', primary: false },
      ],
      transactions: [
        { id: 1, name: 'Received from John', time: 'Today, 10:45 AM', amount: 250, type: 'income' },
        { id: 2, name: 'Coffee Shop', time: 'Yesterday, 8:30 AM', amount: -4.5, type: 'expense' },
        { id: 3, name: 'Grocery Store', time: 'Yesterday, 6:15 PM', amount: -32.75, type: 'expense' },
      ],
    },
  },
  {
    username: 'Alex',
    password: 'password2',
    data: {
      name: 'Alex',
      balance: 1200.0,
      cards: [
        { id: 1, number: '**** **** **** 1234', holder: 'Alex Johnson', expiry: '10/24', primary: true },
      ],
      transactions: [
        { id: 1, name: 'Salary', time: 'Today, 9:00 AM', amount: 1200, type: 'income' },
      ],
    },
  },
  {
    username: 'Alex',
    password: 'password3',
    data: {
      name: 'Alex',
      balance: 500.0,
      cards: [
        { id: 1, number: '**** **** **** 5678', holder: 'Alex Johnson', expiry: '12/23', primary: true },
      ],
      transactions: [
        { id: 1, name: 'Bookstore', time: 'Yesterday, 2:00 PM', amount: -50, type: 'expense' },
      ],
    },
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await pool.query('DELETE FROM transactions');
    await pool.query('DELETE FROM cards');
    await pool.query('DELETE FROM users');
    
    console.log('Cleared existing data');
    
    // Insert users
    for (const user of DEFAULT_USERS) {
      const userResult = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
        [user.username, user.password]
      );
      
      const userId = userResult.rows[0].id;
      console.log(`Created user: ${user.username} with ID: ${userId}`);
      
      // Insert cards for this user
      for (const card of user.data.cards) {
        const cardResult = await pool.query(
          'INSERT INTO cards (user_id, number, holder, expiry, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [userId, card.number, card.holder, card.expiry, user.data.balance]
        );
        
        const cardId = cardResult.rows[0].id;
        console.log(`Created card: ${card.number} with ID: ${cardId}`);
        
        // Insert transactions for this card
        for (const transaction of user.data.transactions) {
          await pool.query(
            'INSERT INTO transactions (card_id, name, time, amount, type) VALUES ($1, $2, $3, $4, $5)',
            [cardId, transaction.name, new Date(), transaction.amount, transaction.type]
          );
        }
      }
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 