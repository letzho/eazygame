import React, { useState, useMemo } from 'react';
import styles from './TransactionsModal.module.css';

export default function TransactionsModal({ open, onClose, transactions, cards }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'name'
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions || [];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(txn => txn.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(txn => 
        txn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
        default:
          return new Date(b.time) - new Date(a.time);
      }
    });

    return filtered;
  }, [transactions, filterType, sortBy, searchTerm]);

  // Get card info for transaction
  const getCardInfo = (cardId) => {
    const card = cards?.find(c => c.id === cardId);
    if (!card) return { maskedNumber: 'Unknown', type: 'Unknown' };
    
    const digits = (card.number || '').replace(/\D/g, '');
    const maskedNumber = digits.length >= 4
      ? '**** **** **** ' + digits.slice(-4)
      : card.number || 'Unknown';
    
    return {
      maskedNumber,
      type: card.type || 'prepaid'
    };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Transaction History</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className={styles.transactionsContainer}>
          {filteredAndSortedTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <div className={styles.emptyTitle}>No transactions found</div>
              <div className={styles.emptyText}>
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start making transactions to see them here'
                }
              </div>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {filteredAndSortedTransactions.map((txn, index) => {
                const cardInfo = getCardInfo(txn.card_id);
                const isIncome = txn.type === 'income';
                
                return (
                  <div key={`${txn.id}-${txn.card_id}-${index}`} className={styles.transactionItem}>
                    <div className={styles.transactionIcon}>
                      <span className={styles.iconText}>
                        {isIncome ? '⬆️' : '⬇️'}
                      </span>
                    </div>
                    
                    <div className={styles.transactionDetails}>
                      <div className={styles.transactionName}>{txn.name}</div>
                      <div className={styles.transactionMeta}>
                        <span className={styles.transactionDate}>
                          {formatDate(txn.time)}
                        </span>
                        <span className={styles.transactionCard}>
                          {cardInfo.maskedNumber}
                        </span>
                      </div>
                      <div className={styles.transactionType}>
                        {cardInfo.type} • {isIncome ? 'Credit' : 'Debit'}
                      </div>
                    </div>
                    
                    <div className={styles.transactionAmount}>
                      <span className={`${styles.amountText} ${isIncome ? styles.income : styles.expense}`}>
                        {isIncome ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredAndSortedTransactions.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Transactions:</span>
              <span className={styles.summaryValue}>{filteredAndSortedTransactions.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Income:</span>
              <span className={`${styles.summaryValue} ${styles.income}`}>
                +${filteredAndSortedTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Expenses:</span>
              <span className={`${styles.summaryValue} ${styles.expense}`}>
                -${filteredAndSortedTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
