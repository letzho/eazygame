import React from 'react';
import styles from './DotIndicator.module.css';

const DotIndicator = ({ 
  totalItems, 
  currentIndex, 
  orientation = 'horizontal', 
  size = 'medium',
  color = 'primary'
}) => {
  const dots = Array.from({ length: totalItems }, (_, index) => index);

  return (
    <div className={`${styles.dotContainer} ${styles[orientation]} ${styles[size]}`}>
      {dots.map((index) => (
        <div
          key={index}
          className={`${styles.dot} ${styles[color]} ${currentIndex === index ? styles.active : ''}`}
          aria-label={`Position ${index + 1} of ${totalItems}`}
        />
      ))}
    </div>
  );
};

export default DotIndicator;
