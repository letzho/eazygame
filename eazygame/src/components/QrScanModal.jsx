import React, { useState, useRef } from 'react';
import QrScanner from 'react-qr-scanner';
import jsQR from 'jsqr';

export default function QrScanModal({ open, onClose, onScanSuccess }) {
  const [scanError, setScanError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const fileInputRef = useRef();

  if (!open) return null;

  const handleScan = data => {
    if (data) {
      const value = data.text || data;
      let parsed;
      try {
        parsed = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (e) {
        if (!isNaN(Number(value))) {
          parsed = Number(value);
        } else {
          setScanError('Invalid QR code format.');
          return;
        }
      }
      let amount;
      if (typeof parsed === 'number') {
        amount = parsed;
      } else if (typeof parsed.amount === 'number' || typeof parsed.amount === 'string') {
        amount = Number(parsed.amount);
      }
      if (amount) {
        onScanSuccess(Math.abs(amount));
      } else {
        setScanError('QR code missing amount.');
      }
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

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, minWidth: 320, maxWidth: 380, width: '100%', boxShadow: '0 2px 24px rgba(123,92,255,0.12)', position: 'relative', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
        <h2 style={{ marginBottom: 10, fontSize: '1.1rem', color: '#7b5cff', fontWeight: 700 }}>Scan Bill QR Code</h2>
        <div style={{ marginBottom: 10, color: '#888', fontSize: 15 }}>Scan a merchant or receipt QR code to auto-fill the bill amount.</div>
        <div style={{ width: '100%', height: 220, margin: '0 auto', borderRadius: 12, overflow: 'hidden', background: '#f7f6fd', position: 'relative' }}>
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
            style={{ position: 'absolute', top: 10, right: 54, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
            title="Flip Camera"
          >
            <span style={{ fontSize: 22 }}>🔄</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
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
              style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
              title="Clear Image"
            >
              <span style={{ fontSize: 22 }}>✖️</span>
            </button>
          )}
        </div>
        {scanError && <div style={{ color: '#e14a4a', marginTop: 10 }}>{scanError}</div>}
      </div>
    </div>
  );
} 