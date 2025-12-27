'use client';

import React, { useState } from 'react';
import { MarketplaceItem } from '@/types/antFarm';
import { getAllMarketplaceItems, getAvailableItems } from '@/lib/antFarm/marketplaceItems';
import { spendCurrency, getCurrencyBalance } from '@/lib/antFarm/currency';
import { getCurrentLevel } from '@/lib/game/levelSystem';
import styles from './Marketplace.module.css';

interface MarketplaceProps {
  onPurchase: (item: MarketplaceItem) => void;
}

export default function Marketplace({ onPurchase }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<'cosmetic' | 'functional' | 'all'>('all');
  const [currency, setCurrency] = useState(getCurrencyBalance());
  const currentLevel = getCurrentLevel();
  const allItems = getAvailableItems(currentLevel);
  
  const filteredItems = selectedCategory === 'all'
    ? allItems
    : allItems.filter(item => item.category === selectedCategory);

  const handlePurchase = (item: MarketplaceItem) => {
    if (spendCurrency(item.price, `Purchased ${item.name}`)) {
      setCurrency(getCurrencyBalance());
      onPurchase(item);
    } else {
      alert('Insufficient currency!');
    }
  };

  return (
    <div className={styles.marketplace}>
      <div className={styles.header}>
        <h2 className={styles.title}>MARKETPLACE</h2>
        <div className={styles.currency}>
          Currency: <span className={styles.currencyAmount}>{currency}</span>
        </div>
      </div>

      <div className={styles.categories}>
        <button
          className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          ALL
        </button>
        <button
          className={`${styles.categoryBtn} ${selectedCategory === 'cosmetic' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('cosmetic')}
        >
          COSMETIC
        </button>
        <button
          className={`${styles.categoryBtn} ${selectedCategory === 'functional' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('functional')}
        >
          FUNCTIONAL
        </button>
      </div>

      <div className={styles.itemsGrid}>
        {filteredItems.map(item => (
          <div key={item.id} className={styles.itemCard}>
            <div className={styles.itemIcon}>{item.icon}</div>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemDescription}>{item.description}</div>
              {item.unlockLevel && item.unlockLevel > currentLevel && (
                <div className={styles.locked}>
                  Unlocks at Level {item.unlockLevel}
                </div>
              )}
              {item.effects && (
                <div className={styles.itemEffects}>
                  {item.effects.foodGeneration && (
                    <div>Food: +{item.effects.foodGeneration}/sec</div>
                  )}
                  {item.effects.antCapacity && (
                    <div>Capacity: +{item.effects.antCapacity}</div>
                  )}
                  {item.effects.tunnelSpeed && (
                    <div>Tunnel Speed: {item.effects.tunnelSpeed}x</div>
                  )}
                  {item.effects.pheromoneStrength && (
                    <div>Pheromone: {item.effects.pheromoneStrength}x</div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.itemFooter}>
              <div className={styles.itemPrice}>{item.price} ⚡</div>
              <button
                className={styles.purchaseBtn}
                onClick={() => handlePurchase(item)}
                disabled={currency < item.price || (item.unlockLevel ? item.unlockLevel > currentLevel : false)}
              >
                BUY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

