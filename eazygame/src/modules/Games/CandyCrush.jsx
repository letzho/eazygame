import React, { useState, useEffect } from 'react';
import styles from './CandyCrush.module.css';

const GRID_SIZE = 8;
const CANDY_TYPES = ['🍬', '🍭', '🍪', '🍩', '🍰', '🧁'];

export default function CandyCrush({ onComplete, onRestart, timeLeft, isPlaying }) {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCandy, setSelectedCandy] = useState(null);

  useEffect(() => {
    if (isPlaying && !gameStarted) {
      setGameStarted(true);
      initializeGame();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft]);

  const initializeGame = () => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
        id: Math.random().toString(36).substr(2, 9)
      }))
    );
    setGrid(newGrid);
    setScore(0);
    setSelectedCandy(null);
    setGameStarted(true);
  };

  const handleCandyClick = (row, col) => {
    if (!gameStarted) return;

    const candy = grid[row][col];
    
    if (!selectedCandy) {
      setSelectedCandy({ row, col, candy });
    } else {
      // Check if candies are adjacent
      const isAdjacent = (
        (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
        (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row)
      );

      if (isAdjacent) {
        // Swap candies
        const newGrid = [...grid];
        newGrid[selectedCandy.row][selectedCandy.col] = candy;
        newGrid[row][col] = selectedCandy.candy;
        setGrid(newGrid);

        // Check for matches after swap
        setTimeout(() => {
          checkMatches(newGrid);
        }, 300);
      }
      
      setSelectedCandy(null);
    }
  };

  const checkMatches = (currentGrid) => {
    let hasMatches = false;
    let newGrid = [...currentGrid];

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        if (currentGrid[row][col].type === currentGrid[row][col + 1].type &&
            currentGrid[row][col].type === currentGrid[row][col + 2].type) {
          // Mark for removal
          newGrid[row][col] = { ...newGrid[row][col], matched: true };
          newGrid[row][col + 1] = { ...newGrid[row][col + 1], matched: true };
          newGrid[row][col + 2] = { ...newGrid[row][col + 2], matched: true };
          hasMatches = true;
        }
      }
    }

    // Check vertical matches
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col].type === currentGrid[row + 1][col].type &&
            currentGrid[row][col].type === currentGrid[row + 2][col].type) {
          // Mark for removal
          newGrid[row][col] = { ...newGrid[row][col], matched: true };
          newGrid[row + 1][col] = { ...newGrid[row + 1][col], matched: true };
          newGrid[row + 2][col] = { ...newGrid[row + 2][col], matched: true };
          hasMatches = true;
        }
      }
    }

    if (hasMatches) {
      setGrid(newGrid);
      
      // Count matches and update score
      const matchCount = newGrid.flat().filter(candy => candy.matched).length;
      setScore(prev => prev + matchCount);

      // Remove matched candies and fill with new ones
      setTimeout(() => {
        removeMatchesAndFill(newGrid);
      }, 500);
    }
  };

  const removeMatchesAndFill = (currentGrid) => {
    const newGrid = currentGrid.map(row =>
      row.map(candy => 
        candy.matched 
          ? { type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)], id: Math.random().toString(36).substr(2, 9) }
          : candy
      )
    );
    setGrid(newGrid);

    // Check for new matches
    setTimeout(() => {
      checkMatches(newGrid);
    }, 300);
  };

  const endGame = () => {
    if (score >= 20) {
      onComplete();
    }
  };

  const isSelected = (row, col) => {
    return selectedCandy && selectedCandy.row === row && selectedCandy.col === col;
  };

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h3>🍬 Candy Crush</h3>
          <p>Match 3 or more candies in a row or column!</p>
          <p>Score 20 points to win!</p>
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
        <div className={styles.grid}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((candy, colIndex) => (
                <button
                  key={candy.id}
                  className={`${styles.candy} ${isSelected(rowIndex, colIndex) ? styles.selected : ''} ${candy.matched ? styles.matched : ''}`}
                  onClick={() => handleCandyClick(rowIndex, colIndex)}
                >
                  {candy.type}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {timeLeft === 0 && (
        <div className={styles.gameOver}>
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          {score >= 20 ? (
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