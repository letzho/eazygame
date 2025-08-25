import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AvatarPaymentGame.module.css';

// Import scene backgrounds
import scene1 from '../../assets/scene1.jpg';
import scene2 from '../../assets/scene2.jpg';
import scene3 from '../../assets/scene3.jpg';
import scene5 from '../../assets/scene5.jpg';
import scene6 from '../../assets/scene6.jpg';

// Modern 2D Avatar characters with gaming appeal
const AVATAR_CHARACTERS = [
  { 
    id: 1, 
    name: 'Shadow Blade', 
    color: '#FF6B6B', 
    type: 'Ninja',
    emoji: '🥷',
    description: 'Stealth master',
    rarity: 'Epic',
    power: 85,
    special: 'Shadow Strike'
  },
  { 
    id: 2, 
    name: 'Crystal Mage', 
    color: '#4ECDC4', 
    type: 'Sorcerer',
    emoji: '🔮',
    description: 'Mystical powers',
    rarity: 'Legendary',
    power: 95,
    special: 'Crystal Storm'
  },
  { 
    id: 3, 
    name: 'Thunder Knight', 
    color: '#45B7D1', 
    type: 'Paladin',
    emoji: '⚡',
    description: 'Divine warrior',
    rarity: 'Rare',
    power: 80,
    special: 'Thunder Strike'
  },
  { 
    id: 4, 
    name: 'Forest Archer', 
    color: '#96CEB4', 
    type: 'Ranger',
    emoji: '🏹',
    description: 'Nature\'s guardian',
    rarity: 'Epic',
    power: 88,
    special: 'Rain of Arrows'
  },
  { 
    id: 5, 
    name: 'Dragon Slayer', 
    color: '#FFEAA7', 
    type: 'Warrior',
    emoji: '🐉',
    description: 'Beast hunter',
    rarity: 'Legendary',
    power: 92,
    special: 'Dragon\'s Fury'
  },
  { 
    id: 6, 
    name: 'Cyber Assassin', 
    color: '#DDA0DD', 
    type: 'Rogue',
    emoji: '🤖',
    description: 'Tech ninja',
    rarity: 'Epic',
    power: 87,
    special: 'Cyber Strike'
  },
  { 
    id: 7, 
    name: 'Phoenix Lord', 
    color: '#FFD93D', 
    type: 'Mage',
    emoji: '🔥',
    description: 'Fire master',
    rarity: 'Mythic',
    power: 98,
    special: 'Phoenix Rebirth'
  },
  { 
    id: 8, 
    name: 'Ice Queen', 
    color: '#74B9FF', 
    type: 'Sorceress',
    emoji: '❄️',
    description: 'Frost wielder',
    rarity: 'Legendary',
    power: 90,
    special: 'Frozen Storm'
  }
];

const SCENE_BACKGROUNDS = [scene1, scene2, scene3, scene5, scene6];

// Simple Avatar Component
const Avatar2D = ({ character, position, isRecipient }) => {
  return (
    <div
      className={styles.avatar2D}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        border: `3px solid ${character.color}`,
        boxShadow: `0 0 15px ${character.color}40`
      }}
    >
      <div className={styles.avatarEmoji}>{character.emoji}</div>
      <div className={styles.avatarName}>{character.name}</div>

    </div>
  );
};

// Ball Component with Curved Trajectory
const Ball2D = ({ isThrown, onAnimationComplete, onThrow }) => {
  const [currentPos, setCurrentPos] = useState({ x: 5, y: 50 });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isThrown && !isAnimating) {
      setIsAnimating(true);
      animateBall();
    }
  }, [isThrown]);

  // Reset ball position when not thrown
  useEffect(() => {
    if (!isThrown) {
      setCurrentPos({ x: 5, y: 50 });
      setIsAnimating(false);
    }
  }, [isThrown]);

  const animateBall = () => {
    const startX = 5; // Very close to sender (x: 45 + 2% for closeness)
    const startY = 50; // Match avatar Y position
    const targetX = 75; // Match recipient position (x: 75)
    const targetY = 50; // Match avatar Y position
    const steps = 60;
    const duration = 2000;
    const stepDuration = duration / steps;
    const arcHeight = 60; // Increased curve height for higher curvature

    let currentStep = 0;

    const animate = () => {
      if (currentStep >= steps) {
        setIsAnimating(false);
        onAnimationComplete();
        return;
      }

      const progress = currentStep / steps;
      
      // Create curved trajectory
      const x = startX + (targetX - startX) * progress;
      const y = startY - arcHeight * Math.sin(Math.PI * progress);
      
      setCurrentPos({ x, y });
      currentStep++;
      
      setTimeout(animate, stepDuration);
    };

    animate();
  };

  const handleClick = () => {
    if (!isThrown && !isAnimating) {
      onThrow();
    }
  };

  return (
    <div
      className={styles.ball2D}
      style={{
        left: `${currentPos.x}%`,
        top: `${currentPos.y}%`,
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        zIndex: 10
      }}
      onClick={handleClick}
    >
      <div className={styles.ballInner}>
        <div className={styles.ballCore}>⚡</div>
      </div>
    </div>
  );
};

export default function AvatarPaymentGame({ 
  open, 
  onClose, 
  recipient: initialRecipient, 
  card: initialCard, 
  amount: initialAmount, 
  onPaymentComplete,
  isQuickSend = false,
  availableCards = [],
  message = '',
  availableRecipients = []
}) {
  if (!open) {
    return null;
  }

  const [gameState, setGameState] = useState(initialRecipient ? 'card-select' : 'recipient-select');
  const [localAmount, setLocalAmount] = useState(initialAmount ? initialAmount.toString() : '');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_CHARACTERS[0]);
  const [selectedScene, setSelectedScene] = useState(SCENE_BACKGROUNDS[Math.floor(Math.random() * SCENE_BACKGROUNDS.length)]);
  const [isThrown, setIsThrown] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [selectedCard, setSelectedCard] = useState(initialCard || (availableCards.length > 0 ? availableCards[0] : null));
  const [selectedRecipient, setSelectedRecipient] = useState(initialRecipient);
  const [localMessage, setLocalMessage] = useState(message);

  useEffect(() => {
    if (open) {
      setGameState(initialRecipient ? 'card-select' : 'recipient-select');
      setLocalAmount(initialAmount ? initialAmount.toString() : '');
      setIsThrown(false);
      setShowResult(false);
      setGameResult(null);
      setSelectedCard(initialCard || (availableCards.length > 0 ? availableCards[0] : null));
      setSelectedRecipient(initialRecipient);
      setLocalMessage(message);
      
      const randomScene = SCENE_BACKGROUNDS[Math.floor(Math.random() * SCENE_BACKGROUNDS.length)];
      const randomAvatar = AVATAR_CHARACTERS[Math.floor(Math.random() * AVATAR_CHARACTERS.length)];
      
      setSelectedScene(randomScene);
      setSelectedAvatar(randomAvatar);
    }
  }, [open, initialAmount, initialCard, availableCards, initialRecipient, message]);

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setGameState('card-select');
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setGameState('amount-input');
  };

  const handleAmountSubmit = () => {
    if (localAmount && parseFloat(localAmount) > 0 && selectedCard) {
      setGameState('avatar-select');
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setGameState('game');
  };

  const handleThrow = () => {
    if (isThrown) return;
    setIsThrown(true);
  };

  const handleBallAnimationComplete = () => {
    const success = Math.random() < (selectedAvatar.power / 100);
    const score = Math.floor(parseFloat(localAmount) * 10 + selectedAvatar.power);
    
    setGameResult({ success, score });
    setShowResult(true);

    setTimeout(() => {
      onPaymentComplete({ 
        success, 
        score, 
        card: selectedCard, 
        amount: parseFloat(localAmount),
        recipient: selectedRecipient,
        avatar: selectedAvatar,
        message: localMessage
      });
    }, 2000);
  };

  return (
    <div className={styles.gameOverlay} onClick={onClose}>
      <div className={styles.gameContainer} onClick={e => e.stopPropagation()}>
        {/* Background Scene */}
        <div 
          className={styles.sceneBackground}
          style={{ 
            backgroundImage: selectedScene ? `url(${selectedScene})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Recipient Selection Screen */}
        {gameState === 'recipient-select' && (
          <div className={styles.amountInputScreen}>
            <div className={styles.amountInputHeader}>
              <h2 className={styles.amountInputTitle}>👥 Select Recipient</h2>
              <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

            <div className={styles.amountInputContent}>
              <div className={styles.recipientSelectionGrid}>
                {availableRecipients && availableRecipients.length > 0 ? (
                  availableRecipients.map((recipient) => (
                    <div
                      key={recipient.email}
                      className={styles.recipientOption}
                      onClick={() => handleRecipientSelect(recipient)}
                    >
                      <div className={styles.recipientOptionIcon}>👤</div>
                      <div className={styles.recipientOptionInfo}>
                        <div className={styles.recipientOptionName}>{recipient.name}</div>
                        <div className={styles.recipientOptionEmail}>{recipient.email}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
                    <div>No recipients available</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
                      availableRecipients: {JSON.stringify(availableRecipients)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Card Selection Screen */}
        {gameState === 'card-select' && (
          <div className={styles.amountInputScreen}>
            <div className={styles.amountInputHeader}>
              <h2 className={styles.amountInputTitle}>💳 Select Card</h2>
              <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

            <div className={styles.amountInputContent}>
              <div className={styles.recipientInfo}>
                <h3>Send to: {selectedRecipient?.name || 'Recipient'}</h3>
              </div>

              <div className={styles.cardSelectionGrid}>
                {availableCards.map((card) => {
                  const digits = (card.number || '').replace(/\D/g, '');
                  const masked = digits.length >= 4
                    ? '**** **** **** ' + digits.slice(-4)
                    : card.number;
                  
                  return (
                    <div
                      key={card.id}
                      className={styles.cardOption}
                      onClick={() => handleCardSelect(card)}
                      style={{
                        border: `2px solid ${selectedCard?.id === card.id ? '#4ade80' : '#e0e0f0'}`
                      }}
                    >
                      <div className={styles.cardOptionIcon}>💳</div>
                      <div className={styles.cardOptionInfo}>
                        <div className={styles.cardOptionNumber}>{masked}</div>
                        <div className={styles.cardOptionBalance}>
                          ${Number(card.balance || 0).toFixed(2)}
                        </div>
                        {card.type && (
                          <div className={styles.cardOptionType}>{card.type}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Amount Input Screen */}
        {gameState === 'amount-input' && (
          <div className={styles.amountInputScreen}>
            <div className={styles.amountInputHeader}>
              <h2 className={styles.amountInputTitle}>💰 Enter Amount</h2>
              <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

                                        <div className={styles.amountInputContent}>
                <div className={styles.recipientInfo}>
                  <h3>Send to: {selectedRecipient?.name || 'Recipient'}</h3>
                  <div className={styles.cardInfo}>
                    From: **** **** **** {String(selectedCard?.number || '').slice(-4)} (${Number(selectedCard?.balance || 0).toFixed(2)})
                  </div>
                </div>

                <div className={styles.amountForm}>
                  <label className={styles.amountLabel}>Amount ($):</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={localAmount}
                    onChange={(e) => setLocalAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={styles.amountInput}
                  />
                  
                  <label className={styles.amountLabel}>Message (optional):</label>
                  <input
                    type="text"
                    value={localMessage}
                    onChange={(e) => setLocalMessage(e.target.value)}
                    placeholder="Add a message"
                    className={styles.amountInput}
                  />
                  
                  <button
                    className={styles.startGameButton}
                    onClick={handleAmountSubmit}
                    disabled={!localAmount || parseFloat(localAmount) <= 0}
                  >
                    🎮 Start Battle!
                  </button>
                </div>
              </div>
          </div>
        )}

        {/* Avatar Selection Screen */}
        {gameState === 'avatar-select' && (
          <div className={styles.amountInputScreen}>
            <div className={styles.amountInputHeader}>
              <button 
                className={styles.backButton} 
                onClick={() => setGameState('amount-input')}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ←
              </button>
              <h2 className={styles.amountInputTitle}>🎮 Choose Your Avatar</h2>
              <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

                          <div className={styles.amountInputContent}>
                <div className={styles.recipientInfo}>
                  <h3>Send to: {selectedRecipient?.name || 'Recipient'}</h3>
                  <div className={styles.cardInfo}>
                    From: **** **** **** {String(selectedCard?.number || '').slice(-4)} (${Number(selectedCard?.balance || 0).toFixed(2)})
                  </div>
                  <div className={styles.amountInfo}>
                    Amount: ${parseFloat(localAmount || 0).toFixed(2)}
                  </div>
                  {localMessage && (
                    <div className={styles.messageInfo}>
                      Message: "{localMessage}"
                    </div>
                  )}
                </div>

              <div className={styles.avatarSelectionGrid}>
                {AVATAR_CHARACTERS.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={styles.avatarOption}
                    onClick={() => handleAvatarSelect(avatar)}
                    style={{
                      border: `2px solid ${avatar.color}`
                    }}
                  >
                    <div 
                      className={styles.avatarOptionEmoji}
                      style={{
                        background: `linear-gradient(135deg, ${avatar.color}20, ${avatar.color}40)`,
                        border: `2px solid ${avatar.color}`
                      }}
                    >
                      {avatar.emoji}
                    </div>
                    <div className={styles.avatarOptionContent}>
                      <div className={styles.avatarOptionName}>{avatar.name}</div>
                      <div className={styles.avatarOptionType}>{avatar.type}</div>
                      <div className={styles.avatarOptionPower}>Power: {avatar.power}</div>
                      <div 
                        className={styles.avatarOptionRarity}
                        style={{ color: avatar.color }}
                      >
                        {avatar.rarity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {gameState === 'game' && (
          <div className={styles.gameScreen}>
            <div className={styles.gameHeader}>
              <h2 className={styles.gameTitle}>🎮 Payment Battle</h2>
              <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

            <div className={styles.gameContent}>
              <div className={styles.instructions}>
                <p>🎯 Click the ball to throw it!</p>
                <p>💰 Amount: ${parseFloat(localAmount || 0).toFixed(2)}</p>
              </div>

              <div className={styles.gameArea}>
                {/* Sender Avatar */}
                <Avatar2D 
                  character={selectedAvatar}
                  position={{ x: 15, y: 50 }}
                  isRecipient={false}
                />

                {/* Recipient Avatar */}
                <Avatar2D 
                  character={{
                    ...AVATAR_CHARACTERS[Math.floor(Math.random() * AVATAR_CHARACTERS.length)],
                    name: selectedRecipient?.name || 'Recipient'
                  }}
                  position={{ x: 75, y: 50 }}
                  isRecipient={true}
                />

                {/* Ball */}
                <Ball2D 
                  isThrown={isThrown}
                  onAnimationComplete={handleBallAnimationComplete}
                  onThrow={handleThrow}
                />
              </div>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
              {showResult && (
                <motion.div 
                  className={styles.resultModal}
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '43%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className={styles.resultContent}>
                    <h2 className={styles.resultTitle}>
                      {gameResult.success ? '🎉 Success!' : '❌ Failed'}
                    </h2>
                    <p className={styles.resultMessage}>
                      {gameResult.success 
                        ? `Payment completed! Score: ${gameResult.score}` 
                        : 'Payment failed. Try again!'
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
