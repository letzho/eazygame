import React, { useState, useEffect } from 'react';
import styles from './GoogleSolitaire.module.css';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function GoogleSolitaire({ onComplete, onRestart, timeLeft, isPlaying }) {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());

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
    // Create pairs of cards (simplified version with 6 pairs)
    const cardPairs = [];
    const usedRanks = [];
    
    while (cardPairs.length < 12) { // 6 pairs = 12 cards
      const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      
      if (!usedRanks.includes(rank)) {
        usedRanks.push(rank);
        cardPairs.push({ id: cardPairs.length, rank, suit, isMatched: false });
        cardPairs.push({ id: cardPairs.length, rank, suit, isMatched: false });
      }
    }
    
    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setMatchedPairs(0);
    setFlippedCards(new Set());
    setSelectedCard(null);
    setGameStarted(true);
  };

  const handleCardClick = (cardId) => {
    if (flippedCards.has(cardId)) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched) return;

    const newFlippedCards = new Set(flippedCards);
    newFlippedCards.add(cardId);
    setFlippedCards(newFlippedCards);

    if (selectedCard === null) {
      setSelectedCard(cardId);
    } else {
      // Check for match
      const firstCard = cards.find(c => c.id === selectedCard);
      if (firstCard && firstCard.rank === card.rank) {
        // Match found
        setCards(prev => prev.map(c => 
          c.id === cardId || c.id === selectedCard 
            ? { ...c, isMatched: true }
            : c
        ));
        setMatchedPairs(prev => prev + 1);
        setSelectedCard(null);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(cardId);
            newSet.delete(selectedCard);
            return newSet;
          });
          setSelectedCard(null);
        }, 1000);
      }
    }
  };

  const endGame = () => {
    if (matchedPairs >= 6) {
      onComplete();
    }
  };

  const getCardDisplay = (card) => {
    if (flippedCards.has(card.id) || card.isMatched) {
      return `${card.rank}${card.suit}`;
    }
    return '🂠';
  };

  const getCardClass = (card) => {
    if (card.isMatched) {
      return styles.matched;
    }
    if (flippedCards.has(card.id)) {
      return styles.flipped;
    }
    return styles.hidden;
  };

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h3>🃏 Google Solitaire</h3>
          <p>Match pairs of cards!</p>
          <p>Match 6 pairs to win!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gameInfo}>
        <div className={styles.score}>Pairs: {matchedPairs}/6</div>
      </div>
      
      <div className={styles.gameArea}>
        <div className={styles.grid}>
          {cards.map((card) => (
            <button
              key={card.id}
              className={`${styles.card} ${getCardClass(card)}`}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched}
            >
              {getCardDisplay(card)}
            </button>
          ))}
        </div>
      </div>
      
      {timeLeft === 0 && (
        <div className={styles.gameOver}>
          <h3>Game Over!</h3>
          <p>Pairs matched: {matchedPairs}/6</p>
          {matchedPairs >= 6 ? (
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