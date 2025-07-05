import React, { useState } from 'react';
import styles from './Merchants.module.css';
import MerchantCard from './components/MerchantCard';
import ProductModal from './components/ProductModal';
import Header from '../../components/Header/Header';
import Modal from '../../components/Modal/Modal';

const categories = [
  'All',
  'Fashion',
  'Electronics',
  'Groceries',
  'Pets',
  'Toys',
  'Books',
];
const featuredMerchants = [
  { name: 'Shopee', logo: '🛒' },
  { name: 'Lazada', logo: '📦' },
  { name: 'Tokopedia', logo: '🏪' },
  { name: 'Amazon', logo: '📚' },
];
const products = [
  { id: 1, name: 'Laptop Pro 2023', price: 899, category: 'Electronics', image: '💻' },
  { id: 2, name: 'Designer Bag', price: 129, category: 'Fashion', image: '👜' },
  { id: 3, name: 'Organic Apples', price: 6.5, category: 'Groceries', image: '🍎' },
  { id: 4, name: 'Pet Toy', price: 12, category: 'Pets', image: '🐾' },
];

export default function Merchants({ isSignedIn, user, onProfileClick, cards, setCards }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalProduct, setModalProduct] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAlloc, setPayAlloc] = useState([]); // [{cardId, amount}]
  const [payError, setPayError] = useState('');

  // Calculate total balance from cards
  const totalBalance = cards && Array.isArray(cards)
    ? cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0)
    : 0;

  const handleBuy = (product) => {
    setModalProduct(product);
    setRecentlyViewed((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev;
      return [product, ...prev].slice(0, 6);
    });
    // Initialize all allocations to '' (empty string)
    if (cards && product) {
      setPayAlloc(cards.map(card => ({ cardId: card.id, amount: '' })));
      setShowPayModal(true);
      setPayError('');
    }
  };

  const handlePayAllocChange = (cardId, value) => {
    // Allow empty string, only allow numbers
    if (/^\d*$/.test(value)) {
      setPayAlloc(prev => prev.map(a => a.cardId === cardId ? { ...a, amount: value } : a));
    }
  };

  const handlePayAllocMax = (cardId) => {
    if (!modalProduct) return;
    const totalSoFar = payAlloc.reduce((sum, a) => sum + (a.cardId === cardId ? 0 : Number(a.amount || 0)), 0);
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const max = Math.min(card.balance, modalProduct.price - totalSoFar);
    setPayAlloc(prev => prev.map(a => a.cardId === cardId ? { ...a, amount: String(max) } : a));
  };

  const handleConfirmPay = async () => {
    if (!modalProduct) return;
    const total = payAlloc.reduce((sum, a) => sum + Number(a.amount || 0), 0);
    if (total !== modalProduct.price) {
      setPayError('Total allocated must match product price.');
      return;
    }
    for (const alloc of payAlloc) {
      const card = cards.find(c => c.id === alloc.cardId);
      if (!card) {
        setPayError('Invalid card.');
        return;
      }
      if (Number(alloc.amount || 0) > Number(card.balance)) {
        setPayError('Insufficient balance on one or more cards.');
        return;
      }
    }
    // Deduct and create transaction for each card
    try {
      for (const alloc of payAlloc) {
        const amount = Number(alloc.amount || 0);
        // Only process cards with positive amounts
        if (amount > 0) {
          console.log('Merchants: Sending deduct request with:', { card_id: alloc.cardId, amount });
          // Deduct
          const deductRes = await fetch('http://localhost:3001/api/cards/deduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_id: alloc.cardId, amount })
          });
          if (!deductRes.ok) throw new Error('Failed to deduct from card');
          // Transaction
          const txnRes = await fetch('http://localhost:3001/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user?.id,
              card_id: alloc.cardId,
              name: `Purchase: ${modalProduct.name}`,
              amount: -amount,
              type: 'expense'
            })
          });
          if (!txnRes.ok) throw new Error('Failed to create transaction');
        }
      }
      // Update cards in UI
      setCards(prevCards => prevCards.map(card => {
        const alloc = payAlloc.find(a => a.cardId === card.id);
        return alloc ? { ...card, balance: Number(card.balance) - Number(alloc.amount || 0) } : card;
      }));
      setShowPayModal(false);
      setModalProduct(null);
      setPayAlloc([]);
      setPayError('');
      alert('Payment successful!');
    } catch (e) {
      setPayError('Payment failed: ' + e.message);
    }
  };

  return (
    <div className={styles.container}>
      <Header isSignedIn={isSignedIn} user={user} onProfileClick={onProfileClick} totalBalance={totalBalance} />
      
      <div className={styles.scrollableContent}>
        <nav className={styles.tabs}>
          <span className={styles.tab + ' ' + styles.active}>Merchants</span>
        </nav>
        <section className={styles.categoriesSection}>
          <div className={styles.categoriesRow}>
            {categories.map(cat => (
              <button
                key={cat}
                className={selectedCategory === cat ? styles.categoryActive : styles.categoryBtn}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
        <section className={styles.featuredSection}>
          <div className={styles.featuredTitle}>Featured Merchants</div>
          <div className={styles.featuredRow}>
            {featuredMerchants.map(m => (
              <div key={m.name} className={styles.merchantLogoBox} title={m.name}>
                {m.logo.startsWith('http') ? (
                  <img src={m.logo} alt={m.name} className={styles.merchantLogo} />
                ) : (
                  <div className={styles.merchantEmoji}>{m.logo}</div>
                )}
                <div className={styles.merchantName}>{m.name}</div>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.productsSection}>
          <div className={styles.productsTitle}>Deals</div>
          <div className={styles.productsRow}>
            {products
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .map(product => (
                <MerchantCard
                  key={product.id}
                  product={product}
                  onBuy={() => handleBuy(product)}
                />
              ))}
          </div>
        </section>
        <section className={styles.recentlyViewedSection}>
          <div className={styles.recentlyViewedTitle}>Recently Viewed</div>
          <div className={styles.recentlyViewedRow}>
            {recentlyViewed.length === 0 ? (
              <div className={styles.emptyText}>No items yet.</div>
            ) : (
              recentlyViewed.map(product => (
                <MerchantCard
                  key={product.id}
                  product={product}
                  onBuy={() => handleBuy(product)}
                />
              ))
            )}
          </div>
        </section>
      </div>
      
      <Modal open={showPayModal} onClose={() => setShowPayModal(false)}>
        {modalProduct && (
          <div style={{ padding: 24, minWidth: 320, maxWidth: 400, width: '100%', margin: '0 auto', wordBreak: 'break-word', overflowWrap: 'break-word', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{modalProduct.image || '🛒'}</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 2 }}>{modalProduct.name}</div>
              <div style={{ color: '#888', fontSize: '1rem', marginBottom: 2 }}>{modalProduct.category}</div>
              <div style={{ color: '#7b5cff', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>${modalProduct.price.toFixed(2)}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Allocate payment across your cards:</div>
              {cards.map(card => {
                const alloc = payAlloc.find(a => a.cardId === card.id) || { amount: '' };
                return (
                  <div key={card.id} style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) 80px',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    background: '#f7f6fd',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}>
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>💳 ****{String(card.number).slice(-4)}</span>
                    <span style={{ color: '#888', fontSize: '0.97rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>(${Number(card.balance).toFixed(2)})</span>
                    <input
                      type="number"
                      min={0}
                      max={card.balance}
                      placeholder="0"
                      value={alloc.amount}
                      onChange={e => handlePayAllocChange(card.id, e.target.value)}
                      style={{ width: 70, borderRadius: 6, border: '1.5px solid #e0e0f0', padding: '0.3rem', boxSizing: 'border-box' }}
                    />
                  </div>
                );
              })}
            </div>
            {(() => {
              const total = payAlloc.reduce((sum, a) => sum + Number(a.amount || 0), 0);
              if (total < modalProduct.price) {
                return <div style={{ color: '#e14a4a', fontWeight: 500, textAlign: 'center', marginBottom: 12 }}>Total allocated is less than the product price. Please allocate the full amount.</div>;
              } else if (total > modalProduct.price) {
                return <div style={{ color: '#e14a4a', fontWeight: 500, textAlign: 'center', marginBottom: 12 }}>Total allocated exceeds the product price. Please adjust your allocation.</div>;
              } else if (payError) {
                return <div style={{ color: '#e14a4a', fontWeight: 500, textAlign: 'center', marginBottom: 12 }}>{payError}</div>;
              } else {
                return <div style={{ color: '#888', fontWeight: 500, textAlign: 'center', marginBottom: 12 }}>Total: ${total.toFixed(2)}</div>;
              }
            })()}
            <button
              style={{ background: '#7b5cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', width: '100%', maxWidth: 360, margin: '8px auto 0 auto', boxSizing: 'border-box', display: 'block' }}
              onClick={handleConfirmPay}
              disabled={payAlloc.reduce((sum, a) => sum + Number(a.amount || 0), 0) !== modalProduct.price || payAlloc.some(a => Number(a.amount || 0) < 0 || Number(a.amount || 0) > (cards.find(c => c.id === a.cardId)?.balance || 0))}
            >
              Confirm Payment
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
} 