import React from 'react';
import styles from './NetsLogo.module.css';
import netsLogo from '../../assets/netslogo.jpg';

const NetsLogo = ({ 
  size = 'medium',
  className = '' 
}) => {
  return (
    <div 
      className={`${styles.netsLogoContainer} ${styles[size]} ${className}`}
    >
      <img src={netsLogo} alt="NETS" className={styles.netsLogo} />
    </div>
  );
};

export default NetsLogo;
