import React, { useState, useEffect } from 'react';
import styles from './QueensTangoPinpoint.module.css';

const TARGETS = ['Queens', 'Tango', 'Pinpoint'];
const POSITIONS = [
  { top: '20%', left: '20%' },
  { top: '20%', left: '70%' },
  { top: '60%', left: '45%' },
];

export default function QueensTangoPinpoint({ onComplete, onRestart, timeLeft, isPlaying }) {
  const [currentTarget, setCurrentTarget] = useState('');
  const [score, setScore] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

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
    setGameStarted(true);
    generateNewTarget();
  };

  const generateNewTarget = () => {
    const randomTarget = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const randomPosition = Math.floor(Math.random() * POSITIONS.length);
    setCurrentTarget(randomTarget);
    setTargetPosition(randomPosition);
  };

  const handleTargetClick = () => {
    setScore(score + 1);
    generateNewTarget();
  };

  const handleWrongClick = () => {
    // Penalty for wrong clicks
    setScore(Math.max(0, score - 1));
  };

  const endGame = () => {
    if (score >= 3) {
      onComplete();
    }
  };

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h3>🎯 Queens, Tango, Pinpoint</h3>
          <p>Click on the target that matches the word shown!</p>
          <p>Score 3 points to win!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameInfo}>
        <div className={styles.score}>Score: {score}</div>
        <div className={styles.target}>Target: {currentTarget}</div>
      </div>
      
      <div className={styles.gameArea}>
        {POSITIONS.map((pos, index) => (
          <button
            key={index}
            className={`${styles.targetButton} ${index === targetPosition ? styles.correctTarget : styles.wrongTarget}`}
            style={{ top: pos.top, left: pos.left }}
            onClick={index === targetPosition ? handleTargetClick : handleWrongClick}
          >
            {index === targetPosition ? currentTarget : TARGETS[index]}
          </button>
        ))}
      </div>
      
      {timeLeft === 0 && (
        <div className={styles.gameOver}>
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          {score >= 3 ? (
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