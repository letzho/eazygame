import React, { useState, useEffect } from 'react';
import styles from './Cards.module.css';
import CardFormModal from './CardFormModal';
import Header from '../../components/Header/Header';
import { getCurrentUser } from '../../userStore';

export default function Cards({ isSignedIn, cards, setCards, onProfileClick, user }) {
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Calculate total balance
  const totalBalance = cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0);

  if (!isSignedIn) {
    return (
      <div className={styles.container}>
        <Header isSignedIn={isSignedIn} user={user} onProfileClick={onProfileClick} />
        <div className={styles.scrollableContent}>
          <div style={{padding:'2rem 1rem',textAlign:'center',color:'#888',fontSize:'1.1rem'}}>Please <button style={{color:'var(--primary)',background:'none',border:'none',fontWeight:600,cursor:'pointer'}} onClick={onProfileClick}>sign in</button> to view your cards.</div>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    setEditCard(null);
    setShowModal(true);
  };
  const handleEdit = (card) => {
    setEditCard(card);
    setShowModal(true);
  };
  const handleSubmit = async (card) => {
    const userId = getCurrentUser();
    if (!userId) {
      alert('You must be signed in to add a card.');
      return;
    }
    if (editCard) {
      // TODO: Implement edit card API
      alert('Edit card not implemented');
    } else {
      await fetch('https://localhost:3001/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          number: card.number,
          holder: card.holder,
          expiry: card.expiry
        })
      });
      // Refresh cards
      fetch(`https://localhost:3001/api/cards?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          // Preserve the original order by sorting by ID to maintain consistency
          const sortedData = Array.isArray(data) 
            ? data.map(card => ({ ...card, balance: Number(card.balance) }))
                .sort((a, b) => a.id - b.id) // Sort by ID to maintain consistent order
            : [];
          setCards(sortedData);
        });
    }
    setShowModal(false);
  };
  const handleDelete = () => {
    alert('Delete card not implemented');
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <Header isSignedIn={isSignedIn} user={user} onProfileClick={onProfileClick} totalBalance={totalBalance} />
      
      <div className={styles.scrollableContent}>
        <nav className={styles.tabs}>
          <span className={styles.tab + ' ' + styles.active}>Cards</span>
        </nav>
        <section className={styles.cardsSection}>
          <div className={styles.cardsTitle}>Your Payment Cards</div>
          <div className={styles.cardsList}>
            {Array.isArray(cards) && cards.map(card => {
              const isFlipped = flippedCardId === card.id;
              // Mask card number: show **** **** **** 1234
              const maskedNumber = '**** **** **** ' + String(card.number).slice(-4);
              // Mask expiry: show **/**
              const maskedExpiry = '**/**';
              return (
                <div key={card.id} style={{ position: 'relative', minHeight: 140 }}>
                  <div
                    className={`${styles.cardFlipContainer}${isFlipped ? ' ' + styles.flipped : ''}`}
                    onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                    style={{ cursor: 'pointer', minHeight: 140 }}
                  >
                    <div className={styles.cardFlipInner} style={{ minHeight: 140 }}>
                      {/* Front (masked) */}
                      <div className={`${styles.cardFront} ${card.primary ? styles.cardPrimary : styles.cardSecondary}`}>
                        <div className={styles.cardBalanceLabel}>Balance</div>
                        <div className={styles.cardBalance}>${Number(card.balance || 0).toFixed(2)}</div>
                        <div className={styles.maskedCardDetails}>{maskedNumber}</div>
                        <div className={styles.cardDetailsRow}>
                          <div>
                            <div className={styles.cardHolderLabel}>Card Holder</div>
                            <div className={styles.cardHolder}>{card.holder}</div>
                          </div>
                          <div>
                            <div className={styles.cardExpiryLabel}>Expires</div>
                            <div className={styles.maskedExpiry}>{maskedExpiry}</div>
                          </div>
                        </div>
                        <span className={styles.cardIcon}>💳</span>
                        <button className={styles.editBtn} onClick={e => { e.stopPropagation(); handleEdit(card); }} aria-label="Edit Card">⋮</button>
                      </div>
                      {/* Back (unmasked) */}
                      <div className={`${styles.cardBack} ${card.primary ? styles.cardPrimary : styles.cardSecondary}`}>
                        <div className={styles.cardBalanceLabel}>Balance</div>
                        <div className={styles.cardBalance}>${Number(card.balance || 0).toFixed(2)}</div>
                        <div className={styles.cardNumber}>{card.number}</div>
                        <div className={styles.cardDetailsRow}>
                          <div>
                            <div className={styles.cardHolderLabel}>Card Holder</div>
                            <div className={styles.cardHolder}>{card.holder}</div>
                          </div>
                          <div>
                            <div className={styles.cardExpiryLabel}>Expires</div>
                            <div className={styles.cardExpiry}>{card.expiry}</div>
                          </div>
                        </div>
                        <span className={styles.cardIcon}>💳</span>
                        <button className={styles.editBtn} onClick={e => { e.stopPropagation(); handleEdit(card); }} aria-label="Edit Card">⋮</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {isSignedIn && (
            <button className={styles.addCardBtn} onClick={handleAdd}>＋ Add New Card</button>
          )}
        </section>
        <section className={styles.securitySection}>
          <div className={styles.securityTitle}>Card Security</div>
          <div className={styles.securityText}>
            Your card details are securely encrypted and protected with industry-standard security measures.
          </div>
        </section>
      </div>
      
      <CardFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        initialCard={editCard}
        isEdit={!!editCard}
      />
    </div>
  );
} 