import React, { useState, useRef } from 'react';
import styles from './ScanQR.module.css';
import Header from '../../components/Header/Header';
import QrScanner from 'react-qr-scanner';
import SendMoneyModal from '../../components/SendMoneyModal/SendMoneyModal';
import jsQR from 'jsqr';

export default function ScanQR({ isSignedIn, user, onProfileClick, cards, setCards }) {
  const [code, setCode] = useState('');
  const [scanError, setScanError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [qrAmount, setQrAmount] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef();

  // Calculate total balance from cards
  const totalBalance = cards && Array.isArray(cards)
    ? cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0)
    : 0;

  const handleScan = data => {
    if (data) {
      const value = data.text || data;
      setCode(value);
      let parsed;
      try {
        parsed = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (e) {
        // If not JSON, try to parse as plain number
        if (!isNaN(Number(value))) {
          parsed = Number(value);
        } else {
          alert('Invalid QR code format.');
          return;
        }
      }
      let amount;
      if (typeof parsed === 'number') {
        amount = parsed;
      } else if (typeof parsed.amount === 'number' || typeof parsed.amount === 'string') {
        amount = Number(parsed.amount);
      } else {
        alert('QR code missing amount.');
        return;
      }
      setQrAmount(Math.abs(amount));
      setShowSendMoney(true);
    }
  };

  const handleError = err => {
    setScanError('Camera error: ' + err.message);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      setUploadedImage(ev.target.result);
      // Decode QR from image
      const img = new window.Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qr = jsQR(imageData.data, img.width, img.height);
        if (qr && qr.data) {
          handleScan(qr.data);
        } else {
          setScanError('No QR code found in image.');
        }
      };
      img.onerror = function() {
        setScanError('Failed to load image.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handler for SendMoneyModal
  const handleSendMoney = async (recipient, card, amount) => {
    try {
      console.log('Sending deduct request with:', { card_id: card.id, amount });
      console.log('Card object:', card);
      // Deduct from card
      const deductRes = await fetch('https://eazygamepay-backend-f9cb7b9223fe.herokuapp.com/api/cards/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, amount })
      });
      if (!deductRes.ok) throw new Error('Failed to deduct from card');
      // Add transaction
      const txnRes = await fetch('https://eazygamepay-backend-f9cb7b9223fe.herokuapp.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          card_id: card.id,
          name: `Sent to ${recipient.name}`,
          amount: -amount,
          type: 'expense'
        })
      });
      if (!txnRes.ok) throw new Error('Failed to create transaction');
      // Update card balance in place
      setCards(prevCards => prevCards.map(c =>
        c.id === card.id ? { ...c, balance: Number(c.balance) - Number(amount) } : c
      ));
      setShowSendMoney(false);
      setQrAmount(null);
      alert(`Successfully sent $${amount} to ${recipient.name}`);
    } catch (e) {
      alert('Payment failed: ' + e.message);
    }
  };

  return (
    <div className={styles.container}>
      <Header isSignedIn={isSignedIn} user={user} onProfileClick={onProfileClick} totalBalance={totalBalance} />
      <div className={styles.scrollableContent}>
        <nav className={styles.tabs}>
          <span className={styles.tab + ' ' + styles.active}>Scan QR</span>
        </nav>
        <section className={styles.scanSection}>
          <div className={styles.scanTitle}>Scan QR Code</div>
          <div className={styles.scanSubtitle}>Position the QR code within the frame to scan</div>
          <div className={styles.qrFrame} style={{ position: 'relative' }}>
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded QR" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />
            ) : (
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
                constraints={{ video: { facingMode } }}
              />
            )}
            <button
              type="button"
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              style={{
                position: 'absolute',
                top: 10,
                right: 54,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2
              }}
              title="Flip Camera"
            >
              <span style={{ fontSize: 22 }}>🔄</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2
              }}
              title="Upload QR Image"
            >
              <span style={{ fontSize: 22 }}>🖼️</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </button>
            {uploadedImage && (
              <button
                type="button"
                onClick={() => { setUploadedImage(null); setScanError(''); }}
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                title="Back to Camera"
              >
                Camera
              </button>
            )}
          </div>
          {scanError && <div style={{ color: 'red', marginTop: 8 }}>{scanError}</div>}
        </section>
      </div>
      <SendMoneyModal
        open={showSendMoney}
        onClose={() => { setShowSendMoney(false); setQrAmount(null); }}
        cards={cards}
        onSend={handleSendMoney}
        prefillAmount={qrAmount}
      />
    </div>
  );
} 