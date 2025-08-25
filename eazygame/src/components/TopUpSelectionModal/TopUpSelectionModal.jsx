import React from 'react';
import styles from './TopUpSelectionModal.module.css';

export default function TopUpSelectionModal({ 
  open, 
  onClose, 
  cards, 
  onTopUp 
}) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select Card to Top Up</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {cards.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💳</div>
              <h3>No Cards Found</h3>
              <p>You don't have any cards to top up.</p>
              <p>Add a card first using the "Prepaid Card" button.</p>
            </div>
          ) : (
            <div className={styles.cardsList}>
              {cards.map((card) => {
                const digits = (card.number || '').replace(/\D/g, '');
                const masked = digits.length >= 4
                  ? '**** **** **** ' + digits.slice(-4)
                  : card.number;
                
                return (
                  <div key={card.id} className={styles.cardItem}>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardNumber}>{masked}</div>
                      <div className={styles.cardDetails}>
                        <span className={styles.cardExpiry}>Expires: {card.expiry}</span>
                        <span className={styles.cardBalance}>
                          Balance: ${Number(card.balance ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button 
                        className={styles.topUpBtn}
                        onClick={() => {
                          onTopUp(card.id);
                          onClose();
                        }}
                      >
                        Top Up
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
