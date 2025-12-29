'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ColorPalette } from '@/lib/colorPalettes';
import { useMusicPlayer, MUSIC_PLAYERS } from '@/contexts/MusicPlayerContext';
import styles from './GameMusicPlayer.module.css';

interface GameMusicPlayerProps {
  palette: ColorPalette;
  isPaused?: boolean;
}

export default function GameMusicPlayer({ palette, isPaused = false }: GameMusicPlayerProps) {
  const {
    playerState,
    play,
    pause,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setCurrentPlayer,
  } = useMusicPlayer();
  
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const wasPlayingBeforePauseRef = useRef(false);
  const previousIsPausedRef = useRef(isPaused);

  useEffect(() => {
    initializeWaveform();
  }, []);

  // Handle game pause - pause music when game is paused, but don't interfere on level changes
  useEffect(() => {
    // Only act on actual pause state changes, not on initial mount or level changes
    const isPauseStateChange = previousIsPausedRef.current !== isPaused;
    previousIsPausedRef.current = isPaused;

    if (isPauseStateChange) {
      if (isPaused && playerState.isPlaying) {
        // Game was paused - remember we were playing and pause music
        wasPlayingBeforePauseRef.current = true;
        pause();
        if (waveformRef.current) {
          waveformRef.current.classList.remove(styles.waveformPlaying);
        }
      } else if (!isPaused && wasPlayingBeforePauseRef.current && !playerState.isPlaying) {
        // Game was unpaused - resume music if it was playing before
        wasPlayingBeforePauseRef.current = false;
        play();
        if (waveformRef.current) {
          waveformRef.current.classList.add(styles.waveformPlaying);
        }
      }
    }
  }, [isPaused, playerState.isPlaying, pause, play]);

  // Sync waveform animation with playing state
  useEffect(() => {
    if (playerState.isPlaying && !isPaused) {
      startWaveformAnimation();
    } else {
      stopWaveformAnimation();
    }
  }, [playerState.isPlaying, isPaused]);

  // On mount, restore playing state if music was playing before (for level transitions)
  useEffect(() => {
    // Only restore if game is not paused and music should be playing
    if (!isPaused && playerState.isPlaying) {
      // Ensure music is actually playing (in case iframe lost state)
      const checkAndResume = () => {
        if (playerState.isPlaying && !isPaused) {
          play();
        }
      };
      // Small delay to ensure iframe is ready
      const timeoutId = setTimeout(checkAndResume, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []); // Only run on mount

  const initializeWaveform = () => {
    if (!waveformRef.current) return;
    const waveBars = waveformRef.current.querySelectorAll(`.${styles.waveBar}`);
    waveBars.forEach((bar, index) => {
      const height = Math.random() * 8 + 4; // Compact heights: 4-12px
      (bar as HTMLElement).style.height = `${height}px`;
      (bar as HTMLElement).style.animationDelay = `${index * 0.05}s`;
    });
  };

  const handleTogglePlayPause = () => {
    if (isPaused) return; // Don't toggle if game is paused
    togglePlayPause();
  };

  const handleNextTrack = () => {
    nextTrack();
  };

  const handlePreviousTrack = () => {
    previousTrack();
  };

  const startWaveformAnimation = () => {
    if (waveformRef.current) {
      waveformRef.current.classList.add(styles.waveformPlaying);
    }
  };

  const stopWaveformAnimation = () => {
    if (waveformRef.current) {
      waveformRef.current.classList.remove(styles.waveformPlaying);
    }
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div 
      className={`${styles.musicPlayer} ${isExpanded ? styles.expanded : ''}`}
      style={{
        '--palette-primary': palette.uiColors.primary,
        '--palette-secondary': palette.uiColors.secondary,
        '--palette-accent': palette.uiColors.accent,
      } as React.CSSProperties}
    >
      <div className={styles.playerContent}>
        <button
          className={styles.playPauseButton}
          onClick={handleTogglePlayPause}
          disabled={isPaused}
          aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
          title={isPaused ? 'Game is paused' : playerState.isPlaying ? 'Pause music' : 'Play music'}
        >
          {playerState.isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M6,4H10V20H6V4M14,4H18V20H14V4Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
          )}
        </button>

        <div 
          className={styles.waveform}
          ref={waveformRef}
          onClick={() => setIsExpanded(!isExpanded)}
          title="Click to expand/collapse"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.waveBar} />
          ))}
        </div>

        <div className={styles.trackInfo}>
          <button
            className={styles.trackNavButton}
            onClick={handlePreviousTrack}
            aria-label="Previous track"
            title="Previous track"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
            </svg>
          </button>
          <span className={styles.trackName}>{playerState.currentPlayer.name}</span>
          <button
            className={styles.trackNavButton}
            onClick={handleNextTrack}
            aria-label="Next track"
            title="Next track"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className={styles.expandedControls}>
            <button
              className={styles.navButton}
              onClick={handlePreviousTrack}
              aria-label="Previous track"
              title="Previous track"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M6,6H8V18H6M9.5,12L18,18V6L9.5,12Z" />
              </svg>
            </button>
            <div className={styles.trackList}>
              {MUSIC_PLAYERS.map((player) => (
                <button
                  key={player.id}
                  className={`${styles.trackButton} ${playerState.currentPlayer.id === player.id ? styles.active : ''}`}
                  onClick={() => {
                    setCurrentPlayer(player);
                  }}
                >
                  {player.name}
                </button>
              ))}
            </div>
            <button
              className={styles.navButton}
              onClick={handleNextTrack}
              aria-label="Next track"
              title="Next track"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

