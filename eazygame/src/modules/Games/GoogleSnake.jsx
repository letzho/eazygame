import React, { useState, useEffect, useCallback } from 'react';
import styles from './GoogleSnake.module.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

export default function GoogleSnake({ onComplete, onRestart, timeLeft, isPlaying }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameLoop, setGameLoop] = useState(null);

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

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        moveSnake();
      }, GAME_SPEED);
      setGameLoop(interval);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, direction, snake]);

  const initializeGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    generateFood();
  };

  const generateFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += direction.x;
      head.y += direction.y;
      
      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }
      
      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        generateFood();
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [direction, food]);

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction.y === 0) {
          setDirection({ x: 0, y: -1 });
        }
        break;
      case 'ArrowDown':
        if (direction.y === 0) {
          setDirection({ x: 0, y: 1 });
        }
        break;
      case 'ArrowLeft':
        if (direction.x === 0) {
          setDirection({ x: -1, y: 0 });
        }
        break;
      case 'ArrowRight':
        if (direction.x === 0) {
          setDirection({ x: 1, y: 0 });
        }
        break;
      default:
        break;
    }
  }, [gameStarted, gameOver, direction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const endGame = () => {
    if (gameLoop) {
      clearInterval(gameLoop);
      setGameLoop(null);
    }
    setGameOver(true);
    
    if (score >= 5) {
      onComplete();
    }
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        
        let cellClass = styles.cell;
        if (isSnakeHead) {
          cellClass += ` ${styles.snakeHead}`;
        } else if (isSnakeBody) {
          cellClass += ` ${styles.snakeBody}`;
        } else if (isFood) {
          cellClass += ` ${styles.food}`;
        }
        
        row.push(
          <div key={`${x}-${y}`} className={cellClass} />
        );
      }
      grid.push(
        <div key={y} className={styles.row}>
          {row}
        </div>
      );
    }
    return grid;
  };

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h3>🐍 Google Snake</h3>
          <p>Use arrow keys to control the snake!</p>
          <p>Eat food to grow and score points!</p>
          <p>Score 5 points to win!</p>
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
          {renderGrid()}
        </div>
      </div>
      
      {(timeLeft === 0 || gameOver) && (
        <div className={styles.gameOver}>
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          {score >= 5 ? (
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