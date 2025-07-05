import React from 'react';
import styles from './Header.module.css';

export default function Header({ isSignedIn, user, onProfileClick, totalBalance }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.appName}>PayEase</div>
        <div className={styles.greeting}>Hello, {isSignedIn ? (user?.name || user?.username || 'User') : 'Guest'}</div>
      </div>
      <div className={styles.right}>
        <div className={styles.balanceLabel}>Total Balance</div>
        <div className={styles.balance}>${
          typeof totalBalance === 'number'
            ? totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })
            : isSignedIn
              ? (user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00')
              : '0.00'
        }</div>
        <button className={styles.profileBtn} aria-label="Profile" onClick={onProfileClick}>
          <span className={styles.profileIcon}>👤</span>
        </button>
      </div>
    </header>
  );
} 