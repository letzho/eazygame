import React, { useState, useRef, useEffect } from 'react';
import styles from './AIEaze.module.css';
import netsLogo from '../../assets/nets-40.png';
import UserIcon from '../../components/UserIcon/UserIcon';
import BalanceDetailsModal from '../../components/BalanceDetailsModal/BalanceDetailsModal';
import TransactionsModal from '../../components/TransactionsModal/TransactionsModal';
import scanIcon from '../../assets/scan_icon.png';

export default function AIEaze({ isSignedIn, user, onProfileClick, cards, setCards, onTabChange, onSignOut, onShowAuthModal }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBalanceDetailsModal, setShowBalanceDetailsModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Calculate total balance from cards
  const totalBalance = cards && Array.isArray(cards)
    ? cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0)
    : 0;

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hey there! 👋 I'm AI Eaze, your friendly financial assistant! 💰✨\n\nI'm here to help you with:\n• 💳 Managing your cards and payments\n• 🛒 Shopping and deals\n• 📊 Understanding your spending\n• 🎮 Gaming rewards and tips\n• 🍕 Finding great food deals\n\nWhat can I help you with today? 😊",
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the AI API
      const response = await getAIResponse(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Oops! 😅 I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (message) => {
    try {
      const response = await fetch('http://localhost:3001/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response || data.message || "I'm here to help! What would you like to know about money, shopping, food, or gaming?";
    } catch (error) {
      console.error('AI API error:', error);
      // Enhanced fallback responses based on message content
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('money') || lowerMessage.includes('balance') || lowerMessage.includes('payment')) {
        return "💰 I can help you with money-related questions! You can check your balance, make transfers, or learn about payment options. What specific money question do you have?";
      } else if (lowerMessage.includes('shopping') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
        return "🛒 For shopping questions, I can help you find deals, compare prices, or guide you through the shopping process. What are you looking to buy?";
      } else if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('eat')) {
        return "🍕 I love food questions! I can help you find restaurants, suggest dishes, or help with food delivery. What cuisine are you craving?";
      } else if (lowerMessage.includes('game') || lowerMessage.includes('gaming') || lowerMessage.includes('play')) {
        return "🎮 Gaming is awesome! I can help you with game recommendations, tips, or finding gaming deals. What type of games do you enjoy?";
      } else {
        return "Hello! 👋 I'm AI Eaze, your personal assistant for money, shopping, food, and gaming questions. How can I help you today?";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
        <div className={styles.container}>
      {/* White Logo Bar */}
      <div className={styles.logoBar}>
        <div className={styles.logoContainer}>
          <img src={netsLogo} alt="NETS" className={styles.netsLogo} />
        </div>
      </div>
      
      {/* Blue Header Section */}
      <div className={styles.blueHeader}>
        <div className={styles.headerTop}>
          <div className={styles.balanceDisplay}>
            <span className={styles.balanceAmount}>SGD {totalBalance.toFixed(2)}</span>
          </div>
          <div className={styles.profileSection}>
            <UserIcon 
              isSignedIn={isSignedIn}
              user={user}
              onSignIn={onShowAuthModal}
              onSignOut={onSignOut}
              onRegister={onShowAuthModal}
              size="medium"
            />
            {isSignedIn && (
              <div className={styles.welcomeText}>
                Welcome, {user?.username || user?.name || user?.email}!
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button className={styles.viewBalanceLink} onClick={() => setShowBalanceDetailsModal(true)}>
            View balance details &gt;
          </button>
          <button className={styles.transactionsBtn} onClick={() => setShowTransactionsModal(true)}>
            <span className={styles.transactionsText}>Transactions &gt;</span>
          </button>
        </div>
      </div>
      
      <div className={styles.scrollableContent}>
        <nav className={styles.tabs}>
          <span className={styles.tab + ' ' + styles.active}>AI Eaze</span>
        </nav>

        {/* Chat Container */}
        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.botMessage}`}
              >
                <div className={styles.messageContent}>
                  {message.content.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

        </div>
      </div>

      {/* Input Area - Fixed above bottom navigation */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about money, shopping, food, or gaming! 💬"
            className={styles.messageInput}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={styles.sendButton}
          >
            <span className={styles.sendIcon}>📤</span>
          </button>
        </div>
      </div>

      {/* Balance Details Modal */}
      <BalanceDetailsModal 
        open={showBalanceDetailsModal} 
        onClose={() => setShowBalanceDetailsModal(false)} 
        cards={cards} 
        totalBalance={totalBalance} 
      />

      {/* Transactions Modal */}
      <TransactionsModal 
        open={showTransactionsModal} 
        onClose={() => setShowTransactionsModal(false)} 
        transactions={[]} 
        cards={cards} 
      />

      {/* Floating Scan Button */}
      <button className={styles.floatingScanBtn} onClick={() => onTabChange('home')}>
        <img src={scanIcon} alt="Scan" className={styles.scanBtnIcon} />
      </button>
    </div>
  );
}
