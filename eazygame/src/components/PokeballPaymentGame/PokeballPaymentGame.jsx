import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PokeballPaymentGame.module.css';

// Pokemon-style characters for recipients
const POKEMON_CHARACTERS = [
  { id: 1, name: 'Pikachu', image: '⚡', color: '#FFD700', type: 'Electric' },
  { id: 2, name: 'Charizard', image: '🔥', color: '#FF6B35', type: 'Fire' },
  { id: 3, name: 'Blastoise', image: '💧', color: '#4A90E2', type: 'Water' },
  { id: 4, name: 'Venusaur', image: '🌿', color: '#7ED321', type: 'Grass' },
  { id: 5, name: 'Gengar', image: '👻', color: '#9B59B6', type: 'Ghost' },
  { id: 6, name: 'Machamp', image: '💪', color: '#E67E22', type: 'Fighting' },
  { id: 7, name: 'Alakazam', image: '🧠', color: '#F39C12', type: 'Psychic' },
  { id: 8, name: 'Gyarados', image: '🐉', color: '#3498DB', type: 'Water' },
];

export default function PokeballPaymentGame({ 
  open, 
  onClose, 
  recipient, 
  card, 
  amount, 
  onPaymentComplete,
  isQuickSend = false 
}) {
  console.log('PokeballPaymentGame props:', { open, recipient, card, amount, isQuickSend });
  const [gameState, setGameState] = useState('selecting'); // selecting, amount-input, throwing, success, failed
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokeballPosition, setPokeballPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [throwTrajectory, setThrowTrajectory] = useState([]);
  const [score, setScore] = useState(0);
  const [throwCount, setThrowCount] = useState(0);
  const [maxThrows] = useState(3);
  const [catchSuccess, setCatchSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [localAmount, setLocalAmount] = useState('');
  
  const gameContainerRef = useRef(null);
  const pokeballRef = useRef(null);
  const targetRef = useRef(null);

  // Reset game when modal opens
  useEffect(() => {
    if (open) {
      setGameState('selecting');
      setSelectedPokemon(null);
      setScore(0);
      setThrowCount(0);
      setCatchSuccess(false);
      setShowConfetti(false);
      setLocalAmount(amount ? amount.toString() : '');
    }
  }, [open, amount]);

  // Calculate positions when component mounts or pokemon changes
  useEffect(() => {
    if (selectedPokemon && gameContainerRef.current && pokeballRef.current && targetRef.current) {
      const container = gameContainerRef.current.getBoundingClientRect();
      const pokeball = pokeballRef.current.getBoundingClientRect();
      const target = targetRef.current.getBoundingClientRect();

      setPokeballPosition({
        x: pokeball.left - container.left + pokeball.width / 2,
        y: pokeball.top - container.top + pokeball.height / 2
      });

      setTargetPosition({
        x: target.left - container.left + target.width / 2,
        y: target.top - container.top + target.height / 2
      });
    }
  }, [selectedPokemon, gameState]);

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
    // If no amount is set, go to amount input first
    if (!localAmount || parseFloat(localAmount) <= 0) {
      setGameState('amount-input');
    } else {
      setGameState('throwing');
    }
  };

  const calculateThrowTrajectory = (startPos, endPos) => {
    const points = [];
    const steps = 30;
    const height = 100; // Maximum height of the arc

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startPos.x + (endPos.x - startPos.x) * t;
      const y = startPos.y + (endPos.y - startPos.y) * t - height * Math.sin(Math.PI * t);
      points.push({ x, y });
    }

    return points;
  };

  const handleThrow = () => {
    if (throwCount >= maxThrows) return;

    setThrowCount(prev => prev + 1);
    const trajectory = calculateThrowTrajectory(pokeballPosition, targetPosition);
    setThrowTrajectory(trajectory);

    // Simulate throw animation
    setTimeout(() => {
      // Calculate if catch is successful (70% success rate)
      const isSuccessful = Math.random() < 0.7;
      
      if (isSuccessful) {
        setCatchSuccess(true);
        setScore(prev => prev + 100);
        setShowConfetti(true);
        
                 setTimeout(() => {
           setGameState('success');
           onPaymentComplete({
             success: true,
             score: score + 100,
             recipient: recipient,
             card: card,
             amount: parseFloat(localAmount),
             pokemon: selectedPokemon
           });
         }, 2000);
      } else {
        setCatchSuccess(false);
        setScore(prev => prev + 10); // Small points for trying
        
        if (throwCount + 1 >= maxThrows) {
                     setTimeout(() => {
             setGameState('failed');
             onPaymentComplete({
               success: false,
               score: score + 10,
               recipient: recipient,
               card: card,
               amount: parseFloat(localAmount),
               pokemon: selectedPokemon
             });
           }, 1000);
        }
      }
    }, 1000);
  };

  const handleClose = () => {
    if (gameState === 'selecting' || gameState === 'amount-input' || gameState === 'failed') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
          <h2 className={styles.title}>
            {gameState === 'selecting' ? 'Choose Your Target!' : 
             gameState === 'throwing' ? 'Throw Pokeball!' :
             gameState === 'success' ? 'Payment Successful!' : 'Payment Failed!'}
          </h2>
          {gameState === 'throwing' && (
            <div className={styles.gameInfo}>
              <span>Throws: {throwCount}/{maxThrows}</span>
              <span>Score: {score}</span>
            </div>
          )}
        </div>

        {/* Game Container */}
        <div className={styles.gameContainer} ref={gameContainerRef}>
          {gameState === 'selecting' && (
            <div className={styles.selectionScreen}>
                             <div className={styles.recipientInfo}>
                 <h3>Send ${localAmount ? parseFloat(localAmount).toFixed(2) : '0.00'} to:</h3>
                <div className={styles.recipientName}>
                  {recipient?.name || 'Recipient'}
                </div>
                {card && (
                  <div className={styles.cardInfo}>
                    From: **** **** **** {String(card.number).slice(-4)}
                  </div>
                )}
              </div>
              
              <div className={styles.pokemonGrid}>
                {POKEMON_CHARACTERS.map((pokemon) => (
                  <motion.button
                    key={pokemon.id}
                    className={styles.pokemonCard}
                    onClick={() => handlePokemonSelect(pokemon)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ borderColor: pokemon.color }}
                  >
                    <div className={styles.pokemonImage} style={{ color: pokemon.color }}>
                      {pokemon.image}
                    </div>
                    <div className={styles.pokemonName}>{pokemon.name}</div>
                    <div className={styles.pokemonType}>{pokemon.type}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

                     {gameState === 'amount-input' && selectedPokemon && (
             <div className={styles.amountInputScreen}>
               <div className={styles.recipientInfo}>
                 <h3>Send to {recipient?.name || 'Recipient'}:</h3>
                 <div className={styles.selectedPokemon}>
                   <div className={styles.pokemonImage} style={{ color: selectedPokemon.color }}>
                     {selectedPokemon.image}
                   </div>
                   <div className={styles.pokemonName}>{selectedPokemon.name}</div>
                 </div>
               </div>
               
               <div className={styles.amountForm}>
                 <label>Amount ($):</label>
                 <input
                   type="number"
                   min="0.01"
                   step="0.01"
                   value={localAmount}
                   onChange={(e) => setLocalAmount(e.target.value)}
                   placeholder="Enter amount"
                   className={styles.amountInput}
                 />
                 {card && (
                   <div className={styles.cardInfo}>
                     From: **** **** **** {String(card.number).slice(-4)} (${Number(card.balance).toFixed(2)})
                   </div>
                 )}
                 <motion.button
                   className={styles.continueButton}
                   onClick={() => {
                     if (localAmount && parseFloat(localAmount) > 0) {
                       setGameState('throwing');
                     }
                   }}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   disabled={!localAmount || parseFloat(localAmount) <= 0}
                 >
                   Continue to Throw!
                 </motion.button>
               </div>
             </div>
           )}

           {gameState === 'throwing' && selectedPokemon && (
            <div className={styles.gameScreen}>
              {/* Pokeball */}
              <motion.div
                ref={pokeballRef}
                className={styles.pokeball}
                animate={throwTrajectory.length > 0 ? {
                  x: throwTrajectory.map(point => point.x),
                  y: throwTrajectory.map(point => point.y),
                } : {}}
                transition={throwTrajectory.length > 0 ? {
                  duration: 1,
                  ease: "easeOut"
                } : {}}
              >
                <div className={styles.pokeballTop}></div>
                <div className={styles.pokeballCenter}></div>
                <div className={styles.pokeballBottom}></div>
              </motion.div>

              {/* Target Pokemon */}
              <motion.div
                ref={targetRef}
                className={styles.targetPokemon}
                style={{ borderColor: selectedPokemon.color }}
                animate={catchSuccess ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.pokemonImage} style={{ color: selectedPokemon.color }}>
                  {selectedPokemon.image}
                </div>
                <div className={styles.pokemonName}>{selectedPokemon.name}</div>
              </motion.div>

              {/* Throw Button */}
              {throwCount < maxThrows && !catchSuccess && (
                <motion.button
                  className={styles.throwButton}
                  onClick={handleThrow}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={throwTrajectory.length > 0}
                >
                  Throw Pokeball!
                </motion.button>
              )}

              {/* Success Animation */}
              <AnimatePresence>
                {showConfetti && (
                  <div className={styles.confettiContainer}>
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={styles.confetti}
                        style={{
                          left: Math.random() * 100 + '%',
                          backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)]
                        }}
                        initial={{ y: -20, opacity: 1 }}
                        animate={{ y: 400, opacity: 0 }}
                        transition={{ duration: 2, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {gameState === 'success' && (
            <div className={styles.resultScreen}>
              <motion.div
                className={styles.successIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                🎉
              </motion.div>
              <h3>Payment Successful!</h3>
              <p>You caught {selectedPokemon?.name}!</p>
              <p>Final Score: {score}</p>
              <motion.button
                className={styles.continueButton}
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </div>
          )}

          {gameState === 'failed' && (
            <div className={styles.resultScreen}>
              <motion.div
                className={styles.failedIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                😢
              </motion.div>
              <h3>Payment Failed!</h3>
              <p>{selectedPokemon?.name} got away!</p>
              <p>Final Score: {score}</p>
              <motion.button
                className={styles.retryButton}
                                 onClick={() => {
                   setGameState('selecting');
                   setSelectedPokemon(null);
                   setScore(0);
                   setThrowCount(0);
                   setCatchSuccess(false);
                   setLocalAmount('');
                 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
