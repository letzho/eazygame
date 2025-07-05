import React from 'react';
import styles from './TabBar.module.css';

export default function TabBar({ tabs, activeTab, onTabChange }) {
  console.log('TabBar rendering, activeTab:', activeTab, 'tabs:', tabs);
  
  return (
    <nav className={styles.tabBar}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? styles.active : ''}
          onClick={() => {
            console.log('TabBar button clicked:', tab.key);
            onTabChange(tab.key);
          }}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
} 