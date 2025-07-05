import React, { useState, useEffect, useRef } from 'react';
import styles from './Home.module.css';
import Header from '../../components/Header/Header';
import CardFormModal from '../Cards/CardFormModal';
import Modal from '../../components/Modal/Modal';
import SendMoneyModal from '../../components/SendMoneyModal/SendMoneyModal';
import PaymentGame from '../../components/PaymentGame/PaymentGame';
import { getCurrentUser } from '../../userStore';
import QrScanner from 'react-qr-scanner';
import jsQR from 'jsqr';
import QrScanModal from '../../components/QrScanModal';

const FRIENDS_LIST = [
  { name: 'Leow Seng Heang', phone: '+6591850816', email: 'leowseng@gmail.com' },
  { name: 'Evan', phone: '+6582284718', email: 'en.jjlee@gmail.com' },
  { name: 'Alice Tan', phone: '+6581234567', email: 'alice.tan@example.com' },
  { name: 'Ben Lim', phone: '+6582345678', email: 'ben.lim@example.com' },
  { name: 'Cheryl Ng', phone: '+6583456789', email: 'cheryl.ng@example.com' },
];

function getAllTransactions(cards) {
  // Flatten all transactions from all cards, add card info, and sort by date (assume time is parseable)
  return cards
    .flatMap(card =>
      (card.transactions || []).map(txn => ({ ...txn, cardNumber: card.number, cardId: card.id }))
    )
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}

function SplitBillModal(props) {
  const { open, onClose, payer, payerEmail, cards, setCards, setTransactions, amount } = props;
  const [localAmount, setLocalAmount] = useState(amount || '');
  useEffect(() => { setLocalAmount(amount || ''); }, [amount]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(cards && cards.length > 0 ? cards[0].id : '');

  useEffect(() => {
    if (cards && cards.length > 0) setSelectedCardId(cards[0].id);
  }, [cards]);

  const handleFriendToggle = (friend) => {
    setSelectedFriends(prev =>
      prev.some(f => f.email === friend.email)
        ? prev.filter(f => f.email !== friend.email)
        : [...prev, friend]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localAmount || selectedFriends.length === 0 || !selectedCardId) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:3001/api/split-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer,
          payerEmail,
          amount: parseFloat(localAmount),
          friends: selectedFriends,
          message,
          cardId: selectedCardId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, msg: 'Split bill QR codes sent to friends via email!' });
        setLocalAmount('');
        setSelectedFriends([]);
        setMessage('');
        // Refresh cards and transactions
        const userId = getCurrentUser();
        if (userId) {
          fetch(`http://localhost:3001/api/cards?user_id=${userId}`)
            .then(res => res.json())
            .then(data => {
              const cardData = Array.isArray(data)
                ? data.map(card => ({ ...card, balance: Number(card.balance) }))
                : [];
              setCards(cardData);
            });
          fetch(`http://localhost:3001/api/transactions?user_id=${userId}`)
            .then(res => res.json())
            .then(data => setTransactions(data));
        }
      } else {
        setResult({ success: false, msg: data.error || 'Failed to send split bill.' });
      }
    } catch (err) {
      setResult({ success: false, msg: err.message });
    }
    setSending(false);
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 32, minWidth: 340, maxWidth: 420, width: '100%', boxShadow: '0 2px 24px rgba(123,92,255,0.14)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#888' }}>&times;</button>
        <h2 style={{ marginBottom: 16, fontSize: '1.3rem', color: '#7b5cff', fontWeight: 700, textAlign: 'center' }}>Split Bill</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontWeight: 600 }}>Total Bill Amount ($):</label>
            <input type="number" min="0.01" step="0.01" value={localAmount} onChange={e => setLocalAmount(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e0e0f0', marginTop: 6, fontSize: 16 }} required />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Pay with Card:</label>
            <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e0e0f0', marginTop: 6, fontSize: 16 }} required>
              {cards && cards.map(card => (
                <option key={card.id} value={card.id}>
                  **** **** **** {String(card.number).slice(-4)} (Bal: ${Number(card.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Friends to Split With:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, maxHeight: 120, overflowY: 'auto' }}>
              {FRIENDS_LIST.map(friend => (
                <label key={friend.email} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                  <input type="checkbox" checked={selectedFriends.some(f => f.email === friend.email)} onChange={() => handleFriendToggle(friend)} />
                  <span style={{ fontWeight: 500 }}>{friend.name}</span> <span style={{ color: '#888', fontSize: 13 }}>({friend.email})</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Message (optional):</label>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #e0e0f0', marginTop: 6, fontSize: 15 }} />
          </div>
          <div style={{ marginBottom: 6, color: '#7b5cff', fontWeight: 600, textAlign: 'center', fontSize: 16 }}>
            {selectedFriends.length > 0 && localAmount && (
              <>Each pays: ${(parseFloat(localAmount) / (selectedFriends.length + 1)).toFixed(2)}</>
            )}
          </div>
          <button type="submit" disabled={sending || !localAmount || selectedFriends.length === 0 || !selectedCardId} style={{ background: '#7b5cff', color: '#fff', border: 'none', borderRadius: 10, padding: '0.9rem 1.5rem', fontWeight: 700, fontSize: '1.1rem', cursor: sending ? 'not-allowed' : 'pointer', width: '100%', marginTop: 4, boxShadow: '0 2px 8px rgba(123,92,255,0.08)' }}>
            {sending ? 'Sending...' : 'Send Split Bill'}
          </button>
        </form>
        {result && (
          <div style={{ marginTop: 16, color: result.success ? '#2ecc40' : '#e14a4a', fontWeight: 600, textAlign: 'center', fontSize: 15 }}>{result.msg}</div>
        )}
      </div>
    </div>
  );
}

// Split Bill Choice Modal
const SplitBillChoiceModal = ({ open, onClose, setShowSplitBillQR, setShowSplitBill, setSplitBillAmount }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, minWidth: 320, maxWidth: 380, width: '100%', boxShadow: '0 2px 24px rgba(123,92,255,0.12)', position: 'relative', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
        <h2 style={{ marginBottom: 18, fontSize: '1.2rem', color: '#7b5cff', fontWeight: 700 }}>Split Bill</h2>
        <button onClick={() => { onClose(); setShowSplitBillQR(true); }} style={{ width: '100%', background: '#7b5cff', color: '#fff', border: 'none', borderRadius: 10, padding: '1rem', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, cursor: 'pointer' }}>Scan QR to Split Bill</button>
        <button onClick={() => { onClose(); setSplitBillAmount(''); setShowSplitBill(true); }} style={{ width: '100%', background: '#fff', color: '#7b5cff', border: '2px solid #7b5cff', borderRadius: 10, padding: '1rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>Manual Split Bill</button>
      </div>
    </div>
  );
};

export default function Home({ isSignedIn, user, cards, setCards, onProfileClick, onTabChange }) {
  const [transactions, setTransactions] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [topUpCardId, setTopUpCardId] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showPaymentGame, setShowPaymentGame] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const paymentHandledRef = useRef(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [splitBillAmount, setSplitBillAmount] = useState('');
  const [showSplitBillChoice, setShowSplitBillChoice] = useState(false);
  const [showSplitBillQR, setShowSplitBillQR] = useState(false);
  const [splitBillScanError, setSplitBillScanError] = useState('');
  const [splitBillUploadedImage, setSplitBillUploadedImage] = useState(null);
  const splitBillFileInputRef = useRef();

  useEffect(() => {
    const userId = getCurrentUser();
    if (userId) {
      fetch(`http://localhost:3001/api/transactions?user_id=${userId}`)
        .then(res => res.json())
        .then(data => setTransactions(data));
      fetch(`http://localhost:3001/api/cards?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          const cardData = Array.isArray(data)
            ? data.map(card => ({ ...card, balance: Number(card.balance) }))
            : [];
          setCards(cardData);
        });
    } else {
      setCards([]);
      setTransactions([]);
    }
  }, [isSignedIn]);

  // Calculate total balance
  const totalBalance = cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0);

  // Gather all transactions from all cards
  const allTransactions = transactions.length > 0 ? transactions : getAllTransactions(cards);

  // Sort transactions by time descending (latest first)
  const sortedTransactions = [...allTransactions].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
  console.log('Rendering sortedTransactions:', sortedTransactions);

  // Before rendering, sort cards by id to preserve original order
  const sortedCards = [...cards].sort((a, b) => a.id - b.id);

  // Add new card handler
  const handleAddCard = async (card) => {
    const userId = getCurrentUser();
    if (!userId) {
      alert('You must be signed in to add a card.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          number: card.number,
          holder: card.holder,
          expiry: card.expiry
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Failed to add card: ' + (err.error || 'Unknown error'));
        return;
      }
      // Refresh cards
      fetch(`http://localhost:3001/api/cards?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          const cardData = Array.isArray(data)
            ? data.map(card => ({ ...card, balance: Number(card.balance) }))
            : [];
          setCards(cardData);
        });
      setShowAddCard(false);
    } catch (e) {
      alert('Network error: ' + e.message);
    }
  };

  // Top up handlers
  const openTopUp = (cardId) => {
    setTopUpCardId(cardId);
    setTopUpAmount('');
  };
  const closeTopUp = () => {
    setTopUpCardId(null);
    setTopUpAmount('');
  };
  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    try {
      console.log('Sending top-up request:', { card_id: topUpCardId, amount });
      
      const response = await fetch('http://localhost:3001/api/cards/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: topUpCardId, amount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Top-up successful:', result);
      
      // Refresh cards and transactions
      const userId = getCurrentUser();
      fetch(`http://localhost:3001/api/cards?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCards(prevCards =>
              prevCards.map(card => {
                const updated = data.find(c => c.id === card.id);
                return updated
                  ? { ...card, balance: Number(updated.balance) }
                  : card;
              })
            );
          }
          refreshTransactions(userId);
        });
      closeTopUp();
      alert('Top-up successful!');
    } catch (e) {
      console.error('Top-up error:', e);
      alert('Top up failed: ' + e.message);
    }
  };

  // Send Money handlers
  const handleSendMoney = (recipient, card, amount) => {
    setPaymentData({ recipient, card, amount });
    setShowSendMoney(false);
    setShowPaymentGame(true);
  };

  const handlePaymentComplete = async (result) => {
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;
    setShowPaymentGame(false);
    setPaymentData(null);

    if (result.success) {
      try {
        // Simulate sending money to recipient
        const userId = getCurrentUser();
        console.log('Processing payment for user:', userId);
        
        // Deduct from card
        const deductResponse = await fetch('http://localhost:3001/api/cards/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            card_id: result.card.id, 
            amount: result.amount 
          })
        });
        
        console.log('Deduct response:', deductResponse.status);
        
        if (!deductResponse.ok) {
          const errorData = await deductResponse.json();
          throw new Error(errorData.error || 'Failed to deduct from card');
        }
        
        // Add transaction record
        const transactionResponse = await fetch('http://localhost:3001/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            card_id: result.card.id,
            name: `Sent to ${result.recipient.name}`,
            amount: -result.amount,
            type: 'expense'
          })
        });
        
        console.log('Transaction response:', transactionResponse.status);
        
        if (!transactionResponse.ok) {
          const errorData = await transactionResponse.json();
          throw new Error(errorData.error || 'Failed to create transaction');
        }
        
        // Update only the specific card's balance without fetching all cards
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === result.card.id
              ? { ...card, balance: Number(card.balance) - Number(result.amount) }
              : card
          )
        );
        
        refreshTransactions(userId);
        
        fetch(`http://localhost:3001/api/transactions?user_id=${userId}`)
          .then(res => res.json())
          .then(data => setTransactions(data));
        
        alert(`Successfully sent $${result.amount.toFixed(2)} to ${result.recipient.name}! Score: ${result.score}`);
      } catch (e) {
        console.error('Payment error:', e);
        alert('Payment failed: ' + e.message);
      }
    } else {
      alert(`Game over! You scored ${result.score} goals. Payment cancelled.`);
    }
  };

  useEffect(() => {
    if (!showPaymentGame) paymentHandledRef.current = false;
  }, [showPaymentGame]);

  // Add a helper function to refresh transactions
  const refreshTransactions = (userId) => {
    fetch(`http://localhost:3001/api/transactions?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setTransactions(data));
  };

  return (
    <div className={styles.container}>
      <Header isSignedIn={isSignedIn} user={user} onProfileClick={onProfileClick} totalBalance={totalBalance} />
      
      <div className={styles.scrollableContent}>
        <div style={{ margin: '1.2rem 0 1.5rem 0' }}>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 }}>
            <button onClick={() => setShowSendMoney(true)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 28, color: '#7b5cff', marginBottom: 2 }}>＋</span>
              <span style={{ fontSize: 14 }}>Send</span>
            </button>
            <button onClick={() => setShowSplitBillChoice(true)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', opacity: 1 }}>
              <span style={{ fontSize: 28, color: '#7b5cff', marginBottom: 2 }}>🧾</span>
              <span style={{ fontSize: 14 }}>Split Bill</span>
            </button>
            <button onClick={() => onTabChange('scanqr')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 28, color: '#7b5cff', marginBottom: 2 }}>🔍</span>
              <span style={{ fontSize: 14 }}>Scan</span>
            </button>
            <button onClick={() => onTabChange('merchants')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 28, color: '#7b5cff', marginBottom: 2 }}>🛒</span>
              <span style={{ fontSize: 14 }}>Shop</span>
            </button>
          </div>
        </div>

        {/* Your Cards */}
        <section className={styles.cardsSection}>
          <div className={styles.cardsTitle}>NETS FlashPay</div>
          <div className={styles.cardList}>
            {Array.isArray(sortedCards) && sortedCards.map(card => {
              const digits = (card.number || '').replace(/\D/g, '');
              const masked = digits.length >= 4
                ? '**** **** **** ' + digits.slice(-4)
                : card.number;
              return (
                <div className={styles.cardPrimary} key={card.id}>
                  <div className={styles.cardBalanceLabel}>Current Balance</div>
                  <div className={styles.cardBalance}>${Number(card.balance ?? 0).toFixed(2)}</div>
                  <div className={styles.cardDetailsRow}>
                    <span className={styles.cardNumber}>{masked}</span>
                    <span className={styles.cardExpiry}>{card.expiry}</span>
                  </div>
                  <span className={styles.cardIcon}>💳</span>
                  <button className={styles.addCardBtn} style={{marginTop:12,background:'#7b5cff',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:600,cursor:'pointer'}} onClick={() => openTopUp(card.id)}>Top Up</button>
                </div>
              );
            })}
          </div>
          {isSignedIn && (
            <button className={styles.addCardBtn} onClick={() => setShowAddCard(true)}>＋ Add New Card</button>
          )}
        </section>

        {/* Recent Transactions */}
        <section className={styles.transactionsSection}>
          <div className={styles.transactionsTitle}>Recent Transactions</div>
          <ul className={styles.transactionsList}>
            {sortedTransactions.slice(0, 5).length === 0 && (
              <li className={styles.transaction} style={{justifyContent:'center',color:'#bbb'}}>No transactions yet.</li>
            )}
            {sortedTransactions.slice(0, 5).map(txn => {
              const card = cards.find(c => c.id === txn.card_id);
              const digits = card && card.number ? card.number.replace(/\D/g, '') : '';
              const masked = digits.length >= 4
                ? '**** **** **** ' + digits.slice(-4)
                : card && card.number ? card.number : 'Unknown';
              return (
                <li className={styles.transaction} key={txn.id + '-' + txn.card_id}>
                  <span className={styles.txnIcon + ' ' + (txn.type === 'income' ? styles.income : styles.expense)}>
                    {txn.type === 'income' ? '⬆️' : '⬇️'}
                  </span>
                  <div className={styles.txnDetails}>
                    <div className={styles.txnName}>{txn.name}</div>
                    <div className={styles.txnTime}>{new Date(txn.time).toLocaleString()}</div>
                    <div className={styles.cardNumber} style={{fontSize:'0.85rem',color:'#888'}}>Card: {masked}</div>
                  </div>
                  <div className={styles.txnAmount + ' ' + (txn.type === 'income' ? styles.income : styles.expense)}>
                    {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {!isSignedIn && (
          <div style={{padding:'1rem',textAlign:'center',color:'#888',fontSize:'0.9rem',marginTop:'1rem'}}>
            Demo mode - <button style={{color:'var(--primary)',background:'none',border:'none',fontWeight:600,cursor:'pointer'}} onClick={onProfileClick}>sign in</button> for real data
          </div>
        )}
      </div>

      <CardFormModal
        open={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSubmit={handleAddCard}
        isEdit={false}
      />

      <Modal open={!!topUpCardId} onClose={closeTopUp}>
        <form onSubmit={handleTopUp} style={{display:'flex',flexDirection:'column',gap:'1rem',padding:'1rem',minWidth:220}}>
          <div style={{fontWeight:600,fontSize:'1.1rem'}}>Top Up Card</div>
          <input
            type="number"
            min="1"
            step="0.01"
            value={topUpAmount}
            onChange={e => setTopUpAmount(e.target.value)}
            placeholder="Enter amount"
            style={{padding:'0.7rem 1rem',borderRadius:8,border:'1.5px solid #e0e0f0',fontSize:'1rem'}}
            required
          />
          <button type="submit" style={{background:'#7b5cff',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>Top Up</button>
        </form>
      </Modal>

      <SendMoneyModal
        open={showSendMoney}
        onClose={() => setShowSendMoney(false)}
        cards={cards}
        onSend={handleSendMoney}
      />

      <PaymentGame
        open={showPaymentGame}
        onClose={() => setShowPaymentGame(false)}
        recipient={paymentData?.recipient}
        card={paymentData?.card}
        amount={paymentData?.amount}
        onPaymentComplete={handlePaymentComplete}
      />

      <SplitBillChoiceModal open={showSplitBillChoice} onClose={() => setShowSplitBillChoice(false)} setShowSplitBillQR={setShowSplitBillQR} setShowSplitBill={setShowSplitBill} setSplitBillAmount={setSplitBillAmount} />
      <QrScanModal
        open={showSplitBillQR}
        onClose={() => setShowSplitBillQR(false)}
        onScanSuccess={amount => {
          setSplitBillAmount(amount);
          setShowSplitBillQR(false);
          setShowSplitBill(true);
        }}
      />
      <SplitBillModal open={showSplitBill} onClose={() => setShowSplitBill(false)} payer={user?.username || 'User'} payerEmail={user?.email || 'noemail@example.com'} cards={cards} setCards={setCards} setTransactions={setTransactions} amount={splitBillAmount} />
    </div>
  );
} 