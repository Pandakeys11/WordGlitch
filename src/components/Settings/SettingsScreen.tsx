'use client';

import React, { useState, useEffect } from 'react';
import { GameSettings } from '@/lib/storage/types';
import { loadSettings, saveSettings } from '@/lib/storage/gameStorage';
import styles from './SettingsScreen.module.css';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState<GameSettings>(loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleToggle = (key: keyof GameSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className={styles.settingsScreen}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>

        <h1 className={styles.title}>Settings</h1>

        <div className={styles.settingsList}>
          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Sound Effects</h3>
              <p className={styles.settingDescription}>
                Enable sound effects during gameplay
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={() => handleToggle('soundEnabled')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Background Music</h3>
              <p className={styles.settingDescription}>
                Play background music (coming soon)
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={() => handleToggle('musicEnabled')}
                disabled
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Vibration</h3>
              <p className={styles.settingDescription}>
                Haptic feedback on mobile devices
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={() => handleToggle('vibrationEnabled')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.info}>
          <h3 className={styles.infoTitle}>About</h3>
          <p className={styles.infoText}>
            Word Glitch v1.0.0
            <br />
            Find words hidden in the glitch matrix. Challenge yourself with
            increasing difficulty and compete for the highest scores!
          </p>
        </div>
      </div>
    </div>
  );
}

