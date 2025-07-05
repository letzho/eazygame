import React, { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import styles from './CardFormModal.module.css';

function formatCardNumber(value) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  // Group into 4s
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  // Remove all non-digits
  let digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length === 1) {
    // Only allow 0 or 1 as first digit
    if (parseInt(digits, 10) > 1) return '0' + digits + '/';
    return digits;
  }
  let month = digits.slice(0, 2);
  if (parseInt(month, 10) > 12) month = '12';
  let result = month;
  if (digits.length > 2) {
    result += '/' + digits.slice(2, 4);
  }
  return result;
}

export default function CardFormModal({ open, onClose, onSubmit, onDelete, initialCard, isEdit }) {
  const [number, setNumber] = useState(initialCard?.number || '');
  const [holder, setHolder] = useState(initialCard?.holder || '');
  const [expiry, setExpiry] = useState(initialCard?.expiry || '');

  const handleNumberChange = (e) => {
    setNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('CardFormModal handleSubmit called');
    if (!number || !holder || !expiry || expiry.length !== 5) return;
    onSubmit({ ...initialCard, number, holder, expiry });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.title}>{isEdit ? 'Edit Card' : 'Add New Card'}</div>
        <label className={styles.label}>
          Card Number
          <input
            className={styles.input}
            type="text"
            value={number}
            onChange={handleNumberChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
          />
        </label>
        <label className={styles.label}>
          Card Holder
          <input
            className={styles.input}
            type="text"
            value={holder}
            onChange={e => setHolder(e.target.value)}
            placeholder="Name on Card"
            required
          />
        </label>
        <label className={styles.label}>
          Expiry Date
          <input
            className={styles.input}
            type="text"
            value={expiry}
            onChange={handleExpiryChange}
            placeholder="MM/YY"
            maxLength={5}
            required
          />
        </label>
        <div className={styles.actions}>
          <button className={styles.saveBtn} type="submit">{isEdit ? 'Save' : 'Add Card'}</button>
          {isEdit && (
            <button className={styles.deleteBtn} type="button" onClick={onDelete}>Delete</button>
          )}
        </div>
      </form>
    </Modal>
  );
} 