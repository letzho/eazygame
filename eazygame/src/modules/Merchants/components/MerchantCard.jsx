import React from 'react';
import styles from './MerchantCard.module.css';

export default function MerchantCard({ product, onBuy }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        {product.image ? (
          product.image.startsWith('http') ? (
            <img src={product.image} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.emojiIcon}>{product.image}</div>
          )
        ) : (
          <div className={styles.imagePlaceholder}></div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{product.name}</div>
        <div className={styles.category}>{product.category}</div>
        <div className={styles.price}>${product.price}</div>
        <button className={styles.buyBtn} onClick={onBuy}>Buy Now</button>
      </div>
    </div>
  );
} 