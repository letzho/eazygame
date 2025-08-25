import React, { useState } from 'react';
import styles from './UserIcon.module.css';

const UserIcon = ({ 
  isSignedIn = false, 
  user = null,
  onSignIn, 
  onSignOut, 
  onRegister,
  size = 'medium',
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    setShowMenu(!showMenu);
  };

  const handleSignIn = () => {
    setShowMenu(false);
    if (onSignIn) onSignIn();
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Sign out clicked!');
    setShowMenu(false);
    // Ensure sign out action is executed
    if (onSignOut) {
      console.log('Executing onSignOut...');
      onSignOut();
    } else {
      console.log('onSignOut is not provided!');
    }
  };

  const handleRegister = () => {
    setShowMenu(false);
    if (onRegister) onRegister();
  };

  const username = user?.name || user?.username || 'User';

  return (
    <div className={styles.userIconContainer}>
      <div 
        className={`${styles.userIcon} ${styles[size]} ${styles[isSignedIn ? 'signedIn' : 'signedOut']} ${className}`}
        onClick={handleClick}
        title={`User is ${isSignedIn ? 'signed in' : 'signed out'}`}
      >
        <span className={styles.userEmoji}>👤</span>
      </div>
      
      {showMenu && (
        <div className={styles.dropdownMenu}>
                     {isSignedIn ? (
             <button className={styles.menuItem} onClick={handleSignOut}>
               <span className={styles.menuIcon}>🚪</span>
               Sign Out
             </button>
           ) : (
             <>
               <button className={styles.menuItem} onClick={handleSignIn}>
                 <span className={styles.menuIcon}>🔑</span>
                 Sign In
               </button>
               <button className={styles.menuItem} onClick={handleRegister}>
                 <span className={styles.menuIcon}>📝</span>
                 Register
               </button>
             </>
           )}
        </div>
      )}
      
      {/* Backdrop to close menu when clicking outside */}
      {showMenu && (
        <div 
          className={styles.backdrop} 
          onMouseDown={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default UserIcon;
