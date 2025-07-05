import React, { useState } from 'react';
import styles from './SendMoneyModal.module.css';

// Singapore phone numbers with names
const CONTACTS = [
  { name: 'Ah Beng', phone: '+65 81234567' },
  { name: 'Mei Ling', phone: '+65 82345678' },
  { name: 'Raj Kumar', phone: '+65 83456789' },
  { name: 'Sarah Tan', phone: '+65 84567890' },
  { name: 'David Lim', phone: '+65 85678901' },
  { name: 'Priya Singh', phone: '+65 86789012' },
  { name: 'John Wong', phone: '+65 87890123' },
  { name: 'Lisa Chen', phone: '+65 88901234' },
  { name: 'Mike Lee', phone: '+65 89012345' },
  { name: 'Emma Ng', phone: '+65 90123456' },
];

export default function SendMoneyModal({ open, onClose, cards, onSend }) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1); // 1: select contact, 2: select card, 3: enter amount

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setStep(2);
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setStep(3);
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > selectedCard.balance) {
      alert('Insufficient balance');
      return;
    }
    onSend(selectedContact, selectedCard, parseFloat(amount));
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setAmount('');
    } else if (step === 2) {
      setStep(1);
      setSelectedCard(null);
    }
  };

  const handleClose = () => {
    setSelectedContact(null);
    setSelectedCard(null);
    setAmount('');
    setStep(1);
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
          <h2 className={styles.title}>Send Money</h2>
          {step > 1 && (
            <button className={styles.backBtn} onClick={handleBack}>← Back</button>
          )}
        </div>

        {step === 1 && (
          <div className={styles.step}>
            <h3>Select Recipient</h3>
            <div className={styles.contactsList}>
              {CONTACTS.map(contact => (
                <button
                  key={contact.phone}
                  className={styles.contactItem}
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className={styles.contactAvatar}>
                    {contact.name.charAt(0)}
                  </div>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactName}>{contact.name}</div>
                    <div className={styles.contactPhone}>{contact.phone}</div>
                  </div>
                  <div className={styles.contactArrow}>→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h3>Select Card to Send From</h3>
            <div className={styles.cardsList}>
              {cards.map(card => (
                <button
                  key={card.id}
                  className={styles.cardItem}
                  onClick={() => handleCardSelect(card)}
                >
                  <div className={styles.cardIcon}>💳</div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNumber}>
                      **** **** **** {card.number.slice(-4)}
                    </div>
                    <div className={styles.cardBalance}>
                      Balance: ${Number(card.balance).toFixed(2)}
                    </div>
                  </div>
                  <div className={styles.cardArrow}>→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
            <h3>Enter Amount</h3>
            <div className={styles.recipientInfo}>
              <div className={styles.recipientName}>{selectedContact.name}</div>
              <div className={styles.recipientPhone}>{selectedContact.phone}</div>
            </div>
            <form onSubmit={handleAmountSubmit} className={styles.amountForm}>
              <div className={styles.amountInput}>
                <span className={styles.currency}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={selectedCard.balance}
                  required
                />
              </div>
              <div className={styles.balanceInfo}>
                Available: ${Number(selectedCard.balance).toFixed(2)}
              </div>
              <button type="submit" className={styles.sendBtn}>
                Send ${amount || '0.00'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 