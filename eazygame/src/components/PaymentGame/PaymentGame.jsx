import React, { useState, useRef, useEffect } from 'react';
import styles from './PaymentGame.module.css';

export default function PaymentGame({ 
  open, 
  onClose, 
  recipient, 
  card, 
  amount, 
  onPaymentComplete 
}) {
  const [gameState, setGameState] = useState('ready'); // ready, playing, success, failed
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 80 });
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [power, setPower] = useState(0);
  const [direction, setDirection] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [paymentSent, setPaymentSent] = useState(false);
  const paymentSentRef = useRef(false);
  
  const gameRef = useRef(null);
  const powerIntervalRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (open) {
      resetGame();
      paymentSentRef.current = false;
    }
    
    return () => {
      if (powerIntervalRef.current) {
        clearInterval(powerIntervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (gameState === 'playing') {
      updateBallPosition();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ballVelocity, gameState]);

  const resetGame = () => {
    setGameState('ready');
    setBallPosition({ x: 50, y: 80 });
    setBallVelocity({ x: 0, y: 0 });
    setPower(0);
    setDirection(0);
    setScore(0);
    setAttempts(0);
  };

  const startPowerMeter = () => {
    if (gameState !== 'ready') return;
    
    setGameState('powering');
    powerIntervalRef.current = setInterval(() => {
      setPower(prev => {
        if (prev >= 100) {
          clearInterval(powerIntervalRef.current);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const stopPowerMeter = () => {
    if (powerIntervalRef.current) {
      clearInterval(powerIntervalRef.current);
      powerIntervalRef.current = null;
    }
    
    if (gameState === 'powering') {
      kickBall();
    }
  };

  const kickBall = () => {
    setAttempts(prev => prev + 1);
    setGameState('playing');
    // 0deg is down, -45 is down-left, +45 is down-right
    const powerMultiplier = power / 100;
    const maxVelocity = 8;
    setBallVelocity({
      x: Math.sin(direction * Math.PI / 180) * maxVelocity * powerMultiplier,
      y: Math.cos(direction * Math.PI / 180) * maxVelocity * powerMultiplier
    });
  };

  const updateBallPosition = () => {
    if (gameState !== 'playing') return;

    animationRef.current = requestAnimationFrame(() => {
      setBallPosition(prev => {
        const newX = prev.x + ballVelocity.x;
        const newY = prev.y + ballVelocity.y;
        
        // Add gravity (reduced for better control)
        const newVelocityY = ballVelocity.y + 0.3;
        setBallVelocity(prev => ({ ...prev, y: newVelocityY }));
        
        // Check boundaries
        if (newX <= 10 || newX >= 90) {
          setBallVelocity(prev => ({ ...prev, x: -prev.x * 0.8 }));
        }
        
        if (newY >= 85) {
          // Ball hit the ground
          checkGoal(newX);
          return { x: 50, y: 80 };
        }
        
        if (newY <= 10) {
          setBallVelocity(prev => ({ ...prev, y: -prev.y * 0.8 }));
        }
        
        return { x: newX, y: newY };
      });
    });
  };

  const checkGoal = (x) => {
    // Goal is between x: 35-65
    if (x >= 35 && x <= 65) {
      setScore(prev => prev + 1);
      setGameState('success');
      if (!paymentSentRef.current) {
        paymentSentRef.current = true;
        onPaymentComplete({
          success: true,
          score: score + 1, // since setScore is async
          attempts: attempts + 1,
          recipient,
          card,
          amount
        });
      }
    } else {
      setGameState('failed');
      setTimeout(() => {
        const currentAttempts = attempts + 1;
        if (currentAttempts < maxAttempts) {
          setGameState('ready');
          setBallPosition({ x: 50, y: 80 });
          setBallVelocity({ x: 0, y: 0 });
          setPower(0);
        } else {
          if (!paymentSentRef.current) {
            paymentSentRef.current = true;
            onPaymentComplete({
              success: false,
              score,
              attempts: currentAttempts,
              recipient,
              card,
              amount
            });
          }
        }
      }, 1200);
    }
  };

  const handleMouseDown = () => {
    startPowerMeter();
  };

  const handleMouseUp = () => {
    stopPowerMeter();
  };

  const handleMouseMove = (e) => {
    if (gameState === 'ready' || gameState === 'powering') {
      const rect = gameRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Angle: 0 is down, -45 is left, +45 is right
      const angle = Math.atan2(
        e.clientX - centerX,
        e.clientY - centerY
      ) * 180 / Math.PI;
      setDirection(Math.max(-45, Math.min(45, angle)));
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    startPowerMeter();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopPowerMeter();
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches[0]) {
      const touch = e.touches[0];
      const rect = gameRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(
        touch.clientX - centerX,
        touch.clientY - centerY
      ) * 180 / Math.PI;
      setDirection(Math.max(-45, Math.min(45, angle)));
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.gameContainer}>
        <div className={styles.header}>
          <h2>Score to Send Money! ⚽</h2>
          <div className={styles.gameInfo}>
            <span>Score: {score}</span>
            <span>Attempts: {attempts}/{maxAttempts}</span>
          </div>
        </div>

        <div className={styles.gameArea}>
          <div 
            ref={gameRef}
            className={styles.field}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {/* Goal */}
            <div className={styles.goal}></div>
            
            {/* Ball */}
            <div 
              className={`${styles.ball} ${gameState === 'playing' ? styles.kicked : ''}`}
              style={{
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                transform: `translate(-50%, -50%)`
              }}
            >
              ⚽
            </div>
            
            {/* Power meter */}
            {(gameState === 'ready' || gameState === 'powering') && (
              <div className={styles.powerMeter}>
                <div className={styles.powerBar}>
                  <div 
                    className={styles.powerFill}
                    style={{ width: `${power}%` }}
                  ></div>
                </div>
                <div className={styles.powerText}>{Math.round(power)}%</div>
              </div>
            )}
            
            {/* Direction indicator */}
            {(gameState === 'ready' || gameState === 'powering') && (
              <div 
                className={styles.directionIndicator}
                style={{ transform: `rotate(${direction}deg)` }}
              >
                ↓
              </div>
            )}
            
            {/* Game state messages */}
            {gameState === 'success' && (
              <div className={styles.message + ' ' + styles.success}>
                GOAL! 🎉
              </div>
            )}
            
            {gameState === 'failed' && (
              <div className={styles.message + ' ' + styles.failed}>
                Miss! 😅
              </div>
            )}
            
            {gameState === 'ready' && attempts === 0 && (
              <div className={styles.instructions}>
                Hold and swipe to kick the ball into the goal!
              </div>
            )}
          </div>
        </div>

        <div className={styles.paymentInfo}>
          <div className={styles.recipient}>
            Sending ${amount.toFixed(2)} to {recipient.name}
          </div>
          <div className={styles.card}>
            From: **** **** **** {card.number.slice(-4)}
          </div>
        </div>

        {gameState === 'ready' && (
          <div className={styles.controls}>
            <p>Hold and swipe to aim and power your shot!</p>
            <button 
              onClick={() => {
                setPower(50);
                setDirection(0);
                kickBall();
              }}
              style={{
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                marginTop: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Test Shot (50% power, straight)
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 