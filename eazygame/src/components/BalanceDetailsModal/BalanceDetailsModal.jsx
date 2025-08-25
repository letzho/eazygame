import React from 'react';
import styles from './BalanceDetailsModal.module.css';

// Import card design images
import netscard1 from '../../assets/netscard1.png';
import netscard2 from '../../assets/netscard2.png';
import netscard3 from '../../assets/netscard3.png';
import netscard4 from '../../assets/netscard4.png';
import motoringIcon from '../../assets/onemotoringcard_icon.png';

export default function BalanceDetailsModal({ open, onClose, cards, totalBalance }) {
  // Card design mapping
  const cardDesigns = {
    netscard1: netscard1,
    netscard2: netscard2,
    netscard3: netscard3,
    netscard4: netscard4
  };

  // Get card design image
  const getCardDesign = (card) => {
    if (card.type === 'motoring') {
      return motoringIcon;
    }
    
    let cardDesign = card.design;
    if (!cardDesign) {
      const designOptions = ['netscard1', 'netscard2', 'netscard3', 'netscard4'];
      const designIndex = (card.id || 0) % designOptions.length;
      cardDesign = designOptions[designIndex];
    }
    
    return cardDesigns[cardDesign] || netscard1;
  };

  // Format card number
  const formatCardNumber = (cardNumber) => {
    const digits = (cardNumber || '').replace(/\D/g, '');
    return digits.length >= 4
      ? '**** **** **** ' + digits.slice(-4)
      : cardNumber || 'Unknown';
  };

  // Calculate total balance
  const calculatedTotalBalance = cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Balance Details</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>

        {/* Total Balance Summary */}
        <div className={styles.totalBalanceSection}>
          <div className={styles.totalBalanceLabel}>Total Available Balance</div>
          <div className={styles.totalBalanceAmount}>
            SGD {calculatedTotalBalance.toFixed(2)}
          </div>
          <div className={styles.totalBalanceSubtext}>
            Across {cards.length} card{cards.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Cards List */}
        <div className={styles.cardsContainer}>
          <div className={styles.cardsTitle}>Your Cards</div>
          
          {cards.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💳</div>
              <div className={styles.emptyTitle}>No cards found</div>
              <div className={styles.emptyText}>
                Add a card to see your balance details
              </div>
            </div>
          ) : (
            <div className={styles.cardsList}>
              {cards.map((card, index) => {
                const cardDesignImage = getCardDesign(card);
                const maskedNumber = formatCardNumber(card.number);
                const balance = Number(card.balance) || 0;
                
                return (
                  <div key={card.id} className={styles.cardItem}>
                    <div className={styles.cardDesignContainer}>
                      <img 
                        src={cardDesignImage} 
                        alt="Card Design" 
                        className={styles.cardDesignImage}
                      />
                      <div className={styles.cardOverlay}>
                        <div className={styles.cardContent}>
                          <div className={styles.cardType}>
                            {card.type === 'motoring' ? 'One Motoring Card' : 
                             card.type === 'prepaid' ? 'Prepaid Card' : 
                             card.type || 'Card'}
                          </div>
                          <div className={styles.cardNumber}>{maskedNumber}</div>
                          <div className={styles.cardExpiry}>{card.expiry}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.cardBalanceInfo}>
                      <div className={styles.cardBalanceLabel}>Available Balance</div>
                      <div className={styles.cardBalanceAmount}>
                        SGD {balance.toFixed(2)}
                      </div>
                      <div className={styles.cardBalancePercentage}>
                        {cards.length > 1 ? 
                          `${((balance / calculatedTotalBalance) * 100).toFixed(1)}% of total` : 
                          '100% of total'
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

                 {/* Footer Info */}
         <div className={styles.footerInfo}>
           <div className={styles.footerText}>
             Last updated: {new Date().toLocaleString()}
           </div>
           <div className={styles.footerNote}>
             Balances are updated in real-time
           </div>
         </div>
      </div>
    </div>
  );
}
