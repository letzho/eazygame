import React, { useState, useEffect } from 'react';
import styles from './PopBubble.module.css';

export default function PopBubble({ onComplete, onRestart, timeLeft, isPlaying }) {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [bubbleInterval, setBubbleInterval] = useState(null);
  const [animationInterval, setAnimationInterval] = useState(null);

  useEffect(() => {
    if (isPlaying && !gameStarted) {
      setGameStarted(true);
      startGame();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft]);

  const startGame = () => {
    setScore(0);
    setBubbles([]);
    setGameStarted(true);
    
    // Generate initial bubbles
    generateBubbles();
    
    // Set up bubble generation interval (faster for more bubbles)
    const interval = setInterval(() => {
      generateBubbles();
    }, 800);
    setBubbleInterval(interval);
    
    // Set up animation interval for bubble movement (smoother flow)
    const animation = setInterval(() => {
      setBubbles(prev => prev.map(bubble => ({
        ...bubble,
        y: bubble.y + (bubble.speed || 0.8), // Use individual bubble speed
        opacity: bubble.y > 85 ? Math.max(0, 1 - (bubble.y - 85) / 10) : 1 // Gradual fade out
      })).filter(bubble => bubble.y < 100)); // Remove bubbles that go off screen
    }, 50);
    setAnimationInterval(animation);
  };

  const generateBubbles = () => {
    const newBubbles = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      x: Math.random() * 85 + 7.5, // 7.5% to 92.5% of container width
      y: -15 - Math.random() * 10, // Start from above the screen with variation
      size: Math.random() * 25 + 25, // 25px to 50px
      color: getRandomBubbleColor(),
      opacity: 1,
      speed: 0.5 + Math.random() * 0.6, // Individual bubble speed
    }));
    
    setBubbles(prev => [...prev, ...newBubbles]);
  };

  const getRandomBubbleColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const popBubble = (bubbleId) => {
    // Add visual feedback before removing
    setBubbles(prev => prev.map(bubble => 
      bubble.id === bubbleId 
        ? { ...bubble, popping: true }
        : bubble
    ));
    
    // Remove bubble after animation
    setTimeout(() => {
      setBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
      setScore(prev => prev + 1);
      
      // Check if player won (pop 10 bubbles to win)
      if (score + 1 >= 10) {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 200);
  };

  const endGame = () => {
    // Clear intervals
    if (bubbleInterval) {
      clearInterval(bubbleInterval);
      setBubbleInterval(null);
    }
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    
    if (score >= 10) {
      onComplete();
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (bubbleInterval) clearInterval(bubbleInterval);
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [bubbleInterval, animationInterval]);

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h3>🫧 Pop Bubble</h3>
          <p>Pop bubbles as they flow down!</p>
          <p>Pop 10 bubbles to win!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameInfo}>
        <div className={styles.score}>Score: {score}</div>
      </div>
      
      <div className={styles.gameArea}>
        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            className={`${styles.bubble} ${bubble.popping ? styles.popping : ''}`}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              backgroundColor: bubble.color,
              opacity: bubble.opacity,
              transition: bubble.popping ? 'all 0.2s ease-out' : 'opacity 0.3s ease',
              transform: bubble.popping ? 'scale(1.5)' : 'scale(1)',
            }}
            onClick={() => !bubble.popping && popBubble(bubble.id)}
            disabled={bubble.popping}
          />
        ))}
      </div>
      
      {timeLeft === 0 && (
        <div className={styles.gameOver}>
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          {score >= 10 ? (
            <p className={styles.win}>🎉 You won! +1 Credit</p>
          ) : (
            <div className={styles.lose}>
              <p>Try again!</p>
              <button className={styles.restartBtn} onClick={onRestart}>
                🔄 Restart Game
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 