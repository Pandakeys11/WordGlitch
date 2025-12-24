'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ColorPalette } from '@/lib/colorPalettes';
import styles from './GameMusicPlayer.module.css';

// Music player configurations (from Omega Player system)
const MUSIC_PLAYERS = [
  {
    id: 'lofi',
    name: 'Lo-Fi',
    videoId: '4xDzrJKXOOY',
  },
  {
    id: 'blues',
    name: 'Blues',
    videoId: '4DxKNOUzvJU',
  },
  {
    id: 'tech',
    name: 'Tech',
    videoId: '-WEWVsC8CyA',
  },
  {
    id: 'funky',
    name: 'Funky',
    videoId: '7XPGU7dmZXg',
  },
  {
    id: 'trance',
    name: 'Trance',
    videoId: 'T2QZpy07j4s',
    playlistId: 'RDT2QZpy07j4s',
  },
  {
    id: 'melodies',
    name: 'Melodies',
    videoId: 'nxqlTRYs6NY',
  },
] as const;

interface GameMusicPlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentPlayer: typeof MUSIC_PLAYERS[number];
}

interface GameMusicPlayerProps {
  palette: ColorPalette;
  isPaused?: boolean;
}

export default function GameMusicPlayer({ palette, isPaused = false }: GameMusicPlayerProps) {
  const [playerState, setPlayerState] = useState<GameMusicPlayerState>({
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
    currentPlayer: MUSIC_PLAYERS[0], // Default to Lo-Fi
  });
  
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Create hidden iframe for YouTube playback
    const iframe = document.createElement('iframe');
    const config = playerState.currentPlayer;
    const playlistParam = config.playlistId ? `&list=${config.playlistId}` : '';
    
    iframe.id = 'game-music-iframe';
    iframe.src = `https://www.youtube.com/embed/${config.videoId}?autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1${playlistParam}`;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.setAttribute('allowfullscreen', '');
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    initializeWaveform();

    return () => {
      if (iframeRef.current && iframeRef.current.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
      }
    };
  }, [playerState.currentPlayer.id]);

  // Handle game pause - pause music when game is paused
  useEffect(() => {
    if (isPaused && playerState.isPlaying) {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
        } catch (e) {
          console.warn('Iframe pause command failed:', e);
        }
      }
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      if (waveformRef.current) {
        waveformRef.current.classList.remove(styles.waveformPlaying);
      }
    }
  }, [isPaused, playerState.isPlaying]);

  const initializeWaveform = () => {
    if (!waveformRef.current) return;
    const waveBars = waveformRef.current.querySelectorAll(`.${styles.waveBar}`);
    waveBars.forEach((bar, index) => {
      const height = Math.random() * 8 + 4; // Compact heights: 4-12px
      (bar as HTMLElement).style.height = `${height}px`;
      (bar as HTMLElement).style.animationDelay = `${index * 0.05}s`;
    });
  };

  const playViaIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
      } catch (e) {
        console.warn('Iframe play command failed:', e);
      }
    }
  };

  const pauseViaIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      } catch (e) {
        console.warn('Iframe pause command failed:', e);
      }
    }
  };

  const handlePlay = () => {
    if (isPaused) return; // Don't play if game is paused
    playViaIframe();
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
    startWaveformAnimation();
  };

  const handlePause = () => {
    pauseViaIframe();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    stopWaveformAnimation();
  };

  const handleTogglePlayPause = () => {
    if (isPaused) return; // Don't toggle if game is paused
    if (playerState.isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleNextTrack = () => {
    const currentIndex = MUSIC_PLAYERS.findIndex(p => p.id === playerState.currentPlayer.id);
    const nextIndex = (currentIndex + 1) % MUSIC_PLAYERS.length;
    const wasPlaying = playerState.isPlaying;
    
    handlePause();
    setPlayerState(prev => ({ ...prev, currentPlayer: MUSIC_PLAYERS[nextIndex] }));
    
    // Auto-play next track if it was playing
    if (wasPlaying && !isPaused) {
      setTimeout(() => {
        handlePlay();
      }, 500);
    }
  };

  const handlePreviousTrack = () => {
    const currentIndex = MUSIC_PLAYERS.findIndex(p => p.id === playerState.currentPlayer.id);
    const prevIndex = currentIndex === 0 ? MUSIC_PLAYERS.length - 1 : currentIndex - 1;
    const wasPlaying = playerState.isPlaying;
    
    handlePause();
    setPlayerState(prev => ({ ...prev, currentPlayer: MUSIC_PLAYERS[prevIndex] }));
    
    // Auto-play previous track if it was playing
    if (wasPlaying && !isPaused) {
      setTimeout(() => {
        handlePlay();
      }, 500);
    }
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
                    const wasPlaying = playerState.isPlaying;
                    handlePause();
                    setPlayerState(prev => ({ ...prev, currentPlayer: player }));
                    if (wasPlaying && !isPaused) {
                      setTimeout(() => handlePlay(), 500);
                    }
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

