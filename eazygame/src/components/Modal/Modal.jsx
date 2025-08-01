import React from 'react';
import styles from './Modal.module.css';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
} 