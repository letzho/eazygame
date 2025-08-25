import React, { useState, useEffect } from 'react';
import styles from './GameContainer.module.css';
import CandyCrush from './CandyCrush';
import PopBubble from './PopBubble';
import Minesweeper from './Minesweeper';
import GoogleSnake from './GoogleSnake';
import GameScoreDisplay from './GameScoreDisplay';
import bubbleSvg from '../../assets/bubble.svg';
import minesweeperSvg from '../../assets/minesweeper.svg';
import snakeSvg from '../../assets/snake.svg';
import candySvg from '../../assets/candy.svg';

const GAMES = [
  { id: 'candy-crush', name: 'Candy Crush', icon: candySvg, component: CandyCrush },
  { id: 'pop-bubble', name: 'Pop Bubble', icon: bubbleSvg, component: PopBubble },
  { id: 'minesweeper', name: 'Minesweeper', icon: minesweeperSvg, component: Minesweeper },
  { id: 'google-snake', name: 'Google Snake', icon: snakeSvg, component: GoogleSnake },
];

export default function GameContainer({ onGameComplete, userCredits = 0, onGameScoreUpdate }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameTimer, setGameTimer] = useState(null);
  const [showGameStats, setShowGameStats] = useState(false);
  const [gameScores, setGameScores] = useState({
    'candy-crush': { gamesPlayed: 0, wins: 0, bestScore: 0 },
    'pop-bubble': { gamesPlayed: 0, wins: 0, bestScore: 0 },
    'minesweeper': { gamesPlayed: 0, wins: 0, bestScore: 0 },
    'google-snake': { gamesPlayed: 0, wins: 0, bestScore: 0 },
  });

  const startGame = (gameId) => {
    setSelectedGame(gameId);
    setIsPlaying(true);
    setTimeLeft(10);
    
    // Update games played count
    setGameScores(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        gamesPlayed: prev[gameId].gamesPlayed + 1
      }
    }));
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setGameTimer(timer);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
  };

  const handleGameComplete = () => {
    endGame();
    
    // Update wins count
    if (selectedGame) {
      setGameScores(prev => ({
        ...prev,
        [selectedGame]: {
          ...prev[selectedGame],
          wins: prev[selectedGame].wins + 1
        }
      }));
    }
    
    onGameComplete(); // This will increase credits
  };

  const closeGame = () => {
    endGame();
    setSelectedGame(null);
  };

  const restartGame = () => {
    // Reset game state and restart
    setTimeLeft(10);
    setIsPlaying(false);
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
    // Small delay to ensure state is reset before starting
    setTimeout(() => {
      startGame(selectedGame);
    }, 100);
  };

  const selectedGameData = GAMES.find(game => game.id === selectedGame);
  const GameComponent = selectedGameData?.component;

  // Update parent component with game scores whenever they change
  useEffect(() => {
    if (onGameScoreUpdate) {
      onGameScoreUpdate(gameScores);
    }
  }, [gameScores, onGameScoreUpdate]);

    return (
    <>
      <div className={styles.gamesContainer}>
        <div className={styles.gamesHeader}>
          <div className={styles.gamesTitle}>🎮 Mini Games</div>
          <button 
            className={styles.statsBtn}
            onClick={() => setShowGameStats(true)}
          >
            📊 Stats
          </button>
        </div>
        
        <div className={styles.gamesScroll}>
          {GAMES.map((game) => (
            <button
              key={game.id}
              className={styles.gameCard}
              onClick={() => startGame(game.id)}
            >
              <div className={styles.gameIcon}>
                <img src={game.icon} alt={game.name} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedGame && (
        <>
          <div className={styles.overlay} onClick={closeGame}></div>
          <div className={styles.gamePlaying}>
                      <div className={styles.gameHeader}>
            <div className={styles.gameInfo}>
              <span className={styles.gameIcon}>
                <img src={selectedGameData.icon} alt={selectedGameData.name} />
              </span>
              <span className={styles.gameName}>{selectedGameData.name}</span>
            </div>
              <div className={styles.gameControls}>
                <div className={styles.timer}>⏱️ {timeLeft}s</div>
                <button className={styles.closeBtn} onClick={closeGame}>✕</button>
              </div>
            </div>
            <div className={styles.gameArea}>
              <GameComponent 
                onComplete={handleGameComplete}
                onRestart={restartGame}
                timeLeft={timeLeft}
                isPlaying={isPlaying}
              />
            </div>
          </div>
        </>
      )}

      {/* Game Stats Modal */}
      {showGameStats && (
        <>
          <div className={styles.overlay} onClick={() => setShowGameStats(false)}></div>
          <div className={styles.statsModal}>
            <div className={styles.statsHeader}>
              <h3>Game Statistics</h3>
              <button 
                className={styles.closeBtn} 
                onClick={() => setShowGameStats(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.statsContent}>
              <GameScoreDisplay gameScores={gameScores} totalCredits={userCredits} />
            </div>
          </div>
        </>
      )}
    </>
  );
} 