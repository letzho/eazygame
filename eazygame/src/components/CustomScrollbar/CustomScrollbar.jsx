import React, { useState, useEffect, useRef } from 'react';
import styles from './CustomScrollbar.module.css';

const CustomScrollbar = ({ 
  children, 
  className = '', 
  orientation = 'vertical',
  color = 'primary',
  size = 'medium'
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const containerRef = useRef(null);
  const scrollbarRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      setShowScrollbar(true);
      
      // Calculate scroll progress
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(progress);

      // Hide scrollbar after scrolling stops
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setTimeout(() => setShowScrollbar(false), 1000);
      }, 150);
    };

    const handleMouseEnter = () => {
      setShowScrollbar(true);
    };

    const handleMouseLeave = () => {
      if (!isScrolling) {
        setTimeout(() => setShowScrollbar(false), 1000);
      }
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutRef.current);
    };
  }, [isScrolling]);

  const handleScrollbarClick = (e) => {
    const container = containerRef.current;
    const scrollbar = scrollbarRef.current;
    if (!container || !scrollbar) return;

    const rect = scrollbar.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollbarHeight = rect.height;
    const scrollRatio = clickY / scrollbarHeight;

    const { scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const newScrollTop = scrollRatio * maxScroll;

    container.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
  };

  const handleScrollbarDrag = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    const scrollbar = scrollbarRef.current;
    if (!container || !scrollbar) return;

    const rect = scrollbar.getBoundingClientRect();
    const scrollbarHeight = rect.height;
    const thumbHeight = scrollbarHeight * (container.clientHeight / container.scrollHeight);
    const maxThumbTravel = scrollbarHeight - thumbHeight;
    
    const mouseY = e.clientY - rect.top;
    const thumbY = Math.max(0, Math.min(mouseY - thumbHeight / 2, maxThumbTravel));
    const scrollRatio = thumbY / maxThumbTravel;

    const { scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const newScrollTop = scrollRatio * maxScroll;

    container.scrollTop = newScrollTop;
  };

  return (
    <div className={`${styles.scrollContainer} ${className}`}>
      <div 
        ref={containerRef}
        className={`${styles.content} ${styles[orientation]}`}
      >
        {children}
      </div>
      
      {orientation === 'vertical' && (
        <div 
          className={`${styles.scrollbar} ${styles[size]} ${styles[color]} ${showScrollbar ? styles.visible : ''}`}
          onClick={handleScrollbarClick}
        >
          <div 
            ref={scrollbarRef}
            className={styles.scrollbarTrack}
          >
            <div 
              className={styles.scrollbarThumb}
              style={{ 
                height: `${Math.max(20, (containerRef.current?.clientHeight / (containerRef.current?.scrollHeight || 1)) * 100)}%`,
                transform: `translateY(${scrollProgress}%)`
              }}
              onMouseDown={handleScrollbarDrag}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomScrollbar;
