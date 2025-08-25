import React, { useState, useEffect } from 'react';
import styles from './Minesweeper.module.css';

const GRID_SIZE = 5;
const MINE_COUNT = 8;

export default function Minesweeper({ onComplete, onRestart, timeLeft, isPlaying }) {
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [safeCellsFound, setSafeCellsFound] = useState(0);

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
    // Create grid with mines
    const newGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ isMine: false, neighborMines: 0 }))
    );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].isMine) {
          newGrid[row][col].neighborMines = countNeighborMines(newGrid, row, col);
        }
      }
    }

    setGrid(newGrid);
    setRevealed(new Set());
    setSafeCellsFound(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const countNeighborMines = (grid, row, col) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
          if (grid[newRow][newCol].isMine) count++;
        }
      }
    }
    return count;
  };

  const handleCellClick = (row, col) => {
    if (gameOver || revealed.has(`${row}-${col}`)) return;

    const cell = grid[row][col];
    const newRevealed = new Set(revealed);
    newRevealed.add(`${row}-${col}`);

    if (cell.isMine) {
      // Game over - reveal all mines
      setGameOver(true);
      revealAllMines();
    } else {
      setRevealed(newRevealed);
      setSafeCellsFound(prev => prev + 1);
      
      // Auto-reveal neighbors if no adjacent mines
      if (cell.neighborMines === 0) {
        revealNeighbors(row, col, newRevealed);
      }
    }
  };

  const revealNeighbors = (row, col, currentRevealed) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        const key = `${newRow}-${newCol}`;
        
        if (newRow >= 0 && newRow < GRID_SIZE && 
            newCol >= 0 && newCol < GRID_SIZE && 
            !currentRevealed.has(key) && 
            !grid[newRow][newCol].isMine) {
          
          currentRevealed.add(key);
          setSafeCellsFound(prev => prev + 1);
          
          if (grid[newRow][newCol].neighborMines === 0) {
            revealNeighbors(newRow, newCol, currentRevealed);
          }
        }
      }
    }
    setRevealed(new Set(currentRevealed));
  };

  const revealAllMines = () => {
    const allMines = new Set();
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col].isMine) {
          allMines.add(`${row}-${col}`);
        }
      }
    }
    setRevealed(new Set([...revealed, ...allMines]));
  };

  const endGame = () => {
    if (safeCellsFound >= 17) { // 25 - 8 mines = 17 safe cells
      onComplete();
    }
  };

  const getCellContent = (row, col) => {
    const cell = grid[row][col];
    const isRevealed = revealed.has(`${row}-${col}`);
    
    if (!isRevealed) {
      return '?';
    }
    
    if (cell.isMine) {
      return '💣';
    }
    
    if (cell.neighborMines === 0) {
      return '';
    }
    
    return cell.neighborMines;
  };

  const getCellClass = (row, col) => {
    const cell = grid[row][col];
    const isRevealed = revealed.has(`${row}-${col}`);
    
    if (!isRevealed) {
      return styles.hidden;
    }
    
    if (cell.isMine) {
      return styles.mine;
    }
    
    return styles.revealed;
  };

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h3>💣 Minesweeper</h3>
          <p>Find all safe cells!</p>
          <p>Find 17 safe cells to win!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameInfo}>
        <div className={styles.score}>Safe: {safeCellsFound}/17</div>
      </div>
      
      <div className={styles.gameArea}>
        <div className={styles.grid}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${getCellClass(rowIndex, colIndex)}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={gameOver}
                >
                  {getCellContent(rowIndex, colIndex)}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {(timeLeft === 0 || gameOver) && (
        <div className={styles.gameOver}>
          <h3>Game Over!</h3>
          <p>Safe cells found: {safeCellsFound}/17</p>
          {safeCellsFound >= 17 ? (
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