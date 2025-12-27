'use client';

import React, { useState } from 'react';
import { Ant, AntTier } from '@/types/antFarm';
import styles from './AntCollection.module.css';

interface AntCollectionProps {
  ants: Ant[];
}

export default function AntCollection({ ants }: AntCollectionProps) {
  const [selectedTier, setSelectedTier] = useState<AntTier | 'all'>('all');
  const [selectedAnt, setSelectedAnt] = useState<Ant | null>(null);

  const filteredAnts = selectedTier === 'all'
    ? ants
    : ants.filter(ant => ant.tier === selectedTier);

  const tierCounts: Record<AntTier, number> = {
    common: ants.filter(a => a.tier === 'common').length,
    uncommon: ants.filter(a => a.tier === 'uncommon').length,
    rare: ants.filter(a => a.tier === 'rare').length,
    legendary: ants.filter(a => a.tier === 'legendary').length,
  };

  const tierColors: Record<AntTier, string> = {
    common: '#888',
    uncommon: '#4A90E2',
    rare: '#9B59B6',
    legendary: '#F39C12',
  };

  return (
    <div className={styles.collection}>
      <div className={styles.header}>
        <h2 className={styles.title}>ANT COLLECTION</h2>
        <div className={styles.total}>Total: {ants.length}</div>
      </div>

      <div className={styles.tierFilters}>
        <button
          className={`${styles.tierBtn} ${selectedTier === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedTier('all')}
        >
          ALL ({ants.length})
        </button>
        {(['common', 'uncommon', 'rare', 'legendary'] as AntTier[]).map(tier => (
          <button
            key={tier}
            className={`${styles.tierBtn} ${selectedTier === tier ? styles.active : ''}`}
            style={{ borderColor: tierColors[tier] }}
            onClick={() => setSelectedTier(tier)}
          >
            {tier.toUpperCase()} ({tierCounts[tier]})
          </button>
        ))}
      </div>

      <div className={styles.antsGrid}>
        {filteredAnts.length === 0 ? (
          <div className={styles.empty}>No ants in collection</div>
        ) : (
          filteredAnts.map(ant => (
            <div
              key={ant.id}
              className={`${styles.antCard} ${selectedAnt?.id === ant.id ? styles.selected : ''}`}
              style={{ borderColor: tierColors[ant.tier] }}
              onClick={() => setSelectedAnt(ant)}
            >
              <div className={styles.antVisual}>
                <div
                  className={styles.antIcon}
                  style={{ backgroundColor: ant.color }}
                />
                <div className={styles.antTier} style={{ color: tierColors[ant.tier] }}>
                  {ant.tier.toUpperCase()}
                </div>
              </div>
              <div className={styles.antInfo}>
                <div className={styles.antName}>{ant.name}</div>
                <div className={styles.antType}>{ant.type}</div>
                <div className={styles.antStats}>
                  <div>Speed: {ant.stats.speed.toFixed(1)}x</div>
                  <div>Stamina: {ant.stats.stamina.toFixed(1)}x</div>
                  <div>Strength: {ant.stats.strength.toFixed(1)}x</div>
                  <div>Intelligence: {ant.stats.intelligence.toFixed(1)}x</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAnt && (
        <div className={styles.antDetails}>
          <div className={styles.detailsHeader}>
            <span>{selectedAnt.name}</span>
            <button onClick={() => setSelectedAnt(null)}>×</button>
          </div>
          <div className={styles.detailsContent}>
            <div><strong>Type:</strong> {selectedAnt.type}</div>
            <div><strong>Tier:</strong> {selectedAnt.tier}</div>
            <div><strong>Acquired:</strong> {new Date(selectedAnt.acquiredAt).toLocaleDateString()}</div>
            <div className={styles.detailsStats}>
              <div><strong>Speed:</strong> {selectedAnt.stats.speed.toFixed(2)}x</div>
              <div><strong>Stamina:</strong> {selectedAnt.stats.stamina.toFixed(2)}x</div>
              <div><strong>Strength:</strong> {selectedAnt.stats.strength.toFixed(2)}x</div>
              <div><strong>Intelligence:</strong> {selectedAnt.stats.intelligence.toFixed(2)}x</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

