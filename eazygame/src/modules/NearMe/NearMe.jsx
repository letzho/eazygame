import React, { useState, useEffect } from 'react';
import styles from './NearMe.module.css';
import netsLogo from '../../assets/nets-40.png';
import UserIcon from '../../components/UserIcon/UserIcon';
import BalanceDetailsModal from '../../components/BalanceDetailsModal/BalanceDetailsModal';
import TransactionsModal from '../../components/TransactionsModal/TransactionsModal';
import scanIcon from '../../assets/scan_icon.png';
import coffeeIcon from '../../assets/coffee.jpg';
import burgerIcon from '../../assets/burger.jpg';
import cakeIcon from '../../assets/cake.jpg';   

export default function NearMe({ isSignedIn, user, onProfileClick, cards, setCards, onTabChange, onSignOut, onShowAuthModal }) {
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('cafe');
  const [selectedCategoryType, setSelectedCategoryType] = useState('cafe');
  const [showBalanceDetailsModal, setShowBalanceDetailsModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);

  // Calculate total balance from cards
  const totalBalance = cards && Array.isArray(cards)
    ? cards.reduce((sum, card) => sum + (Number(card.balance) || 0), 0)
    : 0;

  // Fetch nearby places from Google Places API
  const fetchNearbyPlaces = async (latitude, longitude, type = 'restaurant') => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/places/nearby?lat=${latitude}&lng=${longitude}&type=${type}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby places');
      }
      
      const data = await response.json();
      setNearbyPlaces(data.places || []);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      // Fallback to mock data if API fails
      setNearbyPlaces([
        {
          id: 1,
          name: 'McDonald\'s',
          category: 'Fast Food',
          rating: 4.2,
          distance: '0.3km',
          deliveryTime: '15-25 min',
          image: '🍔',
          priceRange: '$$'
        },
        {
          id: 2,
          name: 'Starbucks Coffee',
          category: 'Coffee',
          rating: 4.5,
          distance: '0.5km',
          deliveryTime: '10-20 min',
          image: '☕',
          priceRange: '$$'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng, selectedCategoryType);
    }
  }, [userLocation, selectedCategoryType]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.log('Error getting location:', error);
          // Use default location (Singapore)
          setUserLocation({ lat: 1.3521, lng: 103.8198 });
        }
      );
    } else {
      setUserLocation({ lat: 1.3521, lng: 103.8198 });
    }
  };

  const handleOrder = (place) => {
    alert(`Ordering from ${place.name} - This would open the restaurant's menu and ordering system`);
  };

  const categories = [
    { key: 'cafe', label: 'Cafes', icon: coffeeIcon, type: 'cafe' },
    { key: 'fastfood', label: 'Fast Food', icon: burgerIcon, type: 'restaurant' },
    { key: 'desserts', label: 'Desserts', icon: cakeIcon, type: 'restaurant' }
  ];

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
          <span className={styles.tab + ' ' + styles.active}>Near Me</span>
        </nav>

        

        {/* Categories */}
        <section className={styles.categoriesSection}>
          <div className={styles.categoriesRow}>
                         {categories.map(cat => (
               <button
                 key={cat.key}
                 className={selectedCategory === cat.key ? styles.categoryActive : styles.categoryBtn}
                 onClick={() => {
                   setSelectedCategory(cat.key);
                   setSelectedCategoryType(cat.type);
                 }}
               >
                 <img src={cat.icon} alt={cat.label} className={styles.categoryIcon} />
                 <span className={styles.categoryLabel}>{cat.label}</span>
               </button>
             ))}
          </div>
        </section>

        {/* Nearby Places */}
        <section className={styles.placesSection}>
          <div className={styles.placesTitle}>Nearby Places</div>
          <div className={styles.placesList}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <div className={styles.loadingText}>Finding nearby places...</div>
              </div>
            ) : (
              nearbyPlaces.map(place => (
              <div key={place.id} className={styles.placeCard}>
                                 <div className={styles.placeImage}>
                   {place.image ? (
                     <img 
                       src={place.image} 
                       alt={place.name} 
                       className={styles.placePhoto}
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }}
                     />
                   ) : null}
                   <div className={styles.placeEmoji} style={{ display: place.image ? 'none' : 'flex' }}>
                     {place.emoji || '🍽️'}
                   </div>
                 </div>
                <div className={styles.placeInfo}>
                  <div className={styles.placeName}>{place.name}</div>
                  <div className={styles.placeCategory}>{place.category}</div>
                  <div className={styles.placeDetails}>
                    <span className={styles.rating}>⭐ {place.rating}</span>
                    <span className={styles.distance}>📍 {place.distance}</span>
                    <span className={styles.deliveryTime}>🕒 {place.deliveryTime}</span>
                  </div>
                  <div className={styles.priceRange}>{place.priceRange}</div>
                </div>
                <button 
                  className={styles.orderBtn}
                  onClick={() => handleOrder(place)}
                >
                  Order
                </button>
              </div>
            ))
            )}
          </div>
        </section>
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
