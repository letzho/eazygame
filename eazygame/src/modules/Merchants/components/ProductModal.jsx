import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import styles from './ProductModal.module.css';

const cards = [
  { id: 1, number: '**** 4289', holder: 'Alex Johnson', expiry: '09/25' },
  { id: 2, number: '**** 7632', holder: 'Alex Johnson', expiry: '11/26' },
];

export default function ProductModal({ product, open, onClose }) {
  const [selectedCard, setSelectedCard] = useState(cards[0].id);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  // Guard clause: if product is null, render nothing
  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose}>
      {!success ? (
        <div className={styles.content}>
          <div className={styles.productInfo}>
            {product.image.startsWith('http') ? (
              <img src={product.image} alt={product.name} className={styles.image} />
            ) : (
              <div className={styles.emojiIcon}>{product.image}</div>
            )}
            <div className={styles.name}>{product.name}</div>
            <div className={styles.category}>{product.category}</div>
            <div className={styles.price}>${product.price}</div>
          </div>
          <div className={styles.selectCardLabel}>Select Card</div>
          <div className={styles.cardsList}>
            {cards.map(card => (
              <button
                key={card.id}
                className={selectedCard === card.id ? styles.cardActive : styles.cardBtn}
                onClick={() => setSelectedCard(card.id)}
              >
                <span className={styles.cardNumber}>{card.number}</span>
                <span className={styles.cardExpiry}>{card.expiry}</span>
              </button>
            ))}
          </div>
          <button className={styles.payBtn} onClick={handlePay}>
            Pay ${product.price}
          </button>
        </div>
      ) : (
        <div className={styles.successMsg}>
          <div className={styles.successIcon}>✅</div>
          <div>Payment Successful!</div>
        </div>
      )}
    </Modal>
  );
} 