'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Music player configurations (from Omega Player system)
export interface MusicPlayerConfig {
  id: string;
  name: string;
  videoId: string;
  playlistId?: string;
}

export const MUSIC_PLAYERS: MusicPlayerConfig[] = [
  {
    id: 'lofi',
    name: 'Lo-Fi',
    videoId: '4xDzrJKXOOY',
  },
  {
    id: 'blues',
    name: 'Blues',
    videoId: 'kIaGRiC_sEY',
    playlistId: 'RDkIaGRiC_sEY',
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
];

interface MusicPlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentPlayer: MusicPlayerConfig;
}

interface MusicPlayerContextType {
  playerState: MusicPlayerState;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setCurrentPlayer: (player: MusicPlayerConfig) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerState, setPlayerState] = useState<MusicPlayerState>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('musicPlayerState');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedPlayer = MUSIC_PLAYERS.find(p => p.id === parsed.currentPlayerId) || MUSIC_PLAYERS[0];
          return {
            isPlaying: parsed.isPlaying || false,
            volume: parsed.volume ?? 0.7,
            isMuted: parsed.isMuted || false,
            currentPlayer: savedPlayer,
          };
        } catch (e) {
          console.warn('Failed to load music player state:', e);
        }
      }
    }
    return {
      isPlaying: false,
      volume: 0.7,
      isMuted: false,
      currentPlayer: MUSIC_PLAYERS[0], // Default to Lo-Fi
    };
  });

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeInitializedRef = useRef(false);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const autoAdvanceEnabledRef = useRef(true); // Enable auto-advance by default

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicPlayerState', JSON.stringify({
        isPlaying: playerState.isPlaying,
        volume: playerState.volume,
        isMuted: playerState.isMuted,
        currentPlayerId: playerState.currentPlayer.id,
      }));
    }
  }, [playerState]);

  // Update iframe source when current player changes
  const updateIframeSource = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const config = playerState.currentPlayer;
    const playlistParam = config.playlistId ? `&list=${config.playlistId}` : '';
    
    iframe.src = `https://www.youtube.com/embed/${config.videoId}?autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1${playlistParam}`;
  }, [playerState.currentPlayer]);

  // Define nextTrack ref for use in message listener (will be set after play/pause are defined)
  const nextTrackRef = useRef<() => void>();

  // Track video duration and current time for end detection
  const videoDurationRef = useRef<number>(0);
  const lastCheckTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up message listener to detect track end
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from YouTube
      if (event.origin !== 'https://www.youtube.com' && event.origin !== 'https://www.youtube-nocookie.com') return;
      
      try {
        let data: any;
        if (typeof event.data === 'string') {
          // Try to parse as JSON
          if (event.data.startsWith('{')) {
            data = JSON.parse(event.data);
          } else {
            // YouTube sometimes sends non-JSON messages
            return;
          }
        } else {
          data = event.data;
        }
        
        // YouTube iframe API sends various event types
        if (data.event === 'onStateChange') {
          // State 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
          const state = data.info !== undefined ? data.info : data.data;
          
          // Log state changes for blues track debugging
          if (playerState.currentPlayer.id === 'blues') {
            console.log('Blues track state change:', state, {
              0: 'ended',
              1: 'playing',
              2: 'paused',
              3: 'buffering',
              5: 'cued'
            }[state]);
          }
          
          if (state === 0 && autoAdvanceEnabledRef.current && playerState.isPlaying) {
            // Track ended - advance to next track
            if (nextTrackRef.current) {
              setTimeout(() => {
                nextTrackRef.current?.();
              }, 500); // Small delay to ensure smooth transition
            }
          } else if (state === 1) {
            // Video started playing - reset check time
            lastCheckTimeRef.current = Date.now();
          } else if (state === -1) {
            // State -1 = unstarted (video not loaded or error)
            if (playerState.currentPlayer.id === 'blues') {
              console.warn('Blues track: Video unstarted or error state');
            }
          }
        } else if (data.event === 'onError') {
          // YouTube error event
          if (playerState.currentPlayer.id === 'blues') {
            console.error('Blues track error:', data.info || data.data);
          }
        } else if (data.event === 'onVideoProgress') {
          // Track video progress
          if (data.info && data.info.currentTime && data.info.duration) {
            videoDurationRef.current = data.info.duration;
            // If we're very close to the end (within 1 second), advance
            if (data.info.duration - data.info.currentTime < 1 && 
                autoAdvanceEnabledRef.current && 
                playerState.isPlaying) {
              if (nextTrackRef.current) {
                setTimeout(() => {
                  nextTrackRef.current?.();
                }, 500);
              }
            }
          }
        }
      } catch (e) {
        // Not a JSON message or not a YouTube message - ignore
      }
    };

    // Add message listener
    window.addEventListener('message', handleMessage);
    messageListenerRef.current = handleMessage;

    // Fallback: Use a more reliable approach - track play start time and estimate duration
    // For YouTube videos, we'll use a combination of:
    // 1. Message events (primary)
    // 2. Time-based estimation (fallback)
    let playStartTime = Date.now();
    let estimatedDuration = 0; // Will be updated when we get duration info
    
    if (playerState.isPlaying) {
      playStartTime = Date.now();
      lastCheckTimeRef.current = playStartTime;
      
      checkIntervalRef.current = setInterval(() => {
        if (!autoAdvanceEnabledRef.current || !playerState.isPlaying) return;
        
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          try {
            // Try to get current playback state
            // Request video info - this helps us detect if video ended
            iframe.contentWindow.postMessage(
              '{"event":"command","func":"getVideoData","args":""}',
              '*'
            );
            
            // Also try to get playback quality (this sometimes triggers state updates)
            iframe.contentWindow.postMessage(
              '{"event":"command","func":"getPlaybackQuality","args":""}',
              '*'
            );
          } catch (e) {
            // Ignore errors
          }
        }
      }, 3000); // Check every 3 seconds - less frequent to reduce overhead
    }

    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener('message', messageListenerRef.current);
        messageListenerRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [playerState.isPlaying]); // Re-run if playing state changes

  // Initialize iframe once - check if it already exists first
  useEffect(() => {
    if (iframeInitializedRef.current) {
      // Iframe already initialized, just restore playing state if needed
      return;
    }
    
    // Check if iframe already exists (from previous mount/unmount cycle)
    const existingIframe = document.getElementById('game-music-iframe') as HTMLIFrameElement;
    if (existingIframe) {
      iframeRef.current = existingIframe;
      iframeInitializedRef.current = true;
      return;
    }
    
    // Create new iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'game-music-iframe';
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.setAttribute('allowfullscreen', '');
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
    iframeInitializedRef.current = true;

    return () => {
      // Don't remove iframe on unmount - keep it for persistence
      // Only remove if the entire app unmounts
    };
  }, []); // Only run once on mount

  // Define playViaIframe before using it in effects
  const playViaIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        // Log which track is being played for debugging
        if (playerState.currentPlayer.id === 'blues') {
          console.log('Playing blues track:', playerState.currentPlayer.videoId);
        }
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
      } catch (e) {
        console.warn('Iframe play command failed:', e);
        if (playerState.currentPlayer.id === 'blues') {
          console.error('Blues track play error:', e);
        }
      }
    } else {
      if (playerState.currentPlayer.id === 'blues') {
        console.warn('Blues track: iframe or contentWindow not available');
      }
    }
  }, [playerState.currentPlayer]);

  // Set initial video source after iframe is created and restore playing state
  useEffect(() => {
    if (iframeRef.current && iframeInitializedRef.current) {
      const config = playerState.currentPlayer;
      // For playlists, we don't use loop since we want to advance to next track in our array
      // YouTube playlists will auto-advance within the playlist, but we want to detect end
      // and move to next track in MUSIC_PLAYERS array
      const playlistParam = config.playlistId 
        ? `&list=${config.playlistId}` 
        : '';
      const wasPlaying = playerState.isPlaying;
      
      // Only update source if player actually changed (not on every render)
      const currentSrc = iframeRef.current.src;
      // Include origin parameter to receive postMessage events
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Verify video ID is valid (not empty, has proper format)
      if (!config.videoId || config.videoId.trim() === '') {
        console.error(`Invalid video ID for track: ${config.id}`);
        return;
      }
      
      const newSrc = `https://www.youtube.com/embed/${config.videoId}?autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1&origin=${encodeURIComponent(origin)}${playlistParam}`;
      
      if (!currentSrc || !currentSrc.includes(config.videoId)) {
        // Player changed or iframe source not set - update source
        // Log for blues track debugging
        if (config.id === 'blues') {
          console.log('Setting blues track iframe source:', newSrc);
          console.log('Blues track video ID:', config.videoId);
        }
        
        // Add error handler for iframe load
        const handleIframeError = () => {
          if (config.id === 'blues') {
            console.error('Blues track iframe failed to load. Video may be unavailable or restricted.');
          }
        };
        
        iframeRef.current.onerror = handleIframeError;
        iframeRef.current.src = newSrc;
        
        // If music was playing, resume after source change
        if (wasPlaying) {
          setTimeout(() => {
            playViaIframe();
          }, 500);
        }
      } else if (wasPlaying) {
        // Source is correct and music should be playing - ensure it's playing
        // This helps restore playback after level transitions
        setTimeout(() => {
          playViaIframe();
        }, 100);
      }
    }
  }, [playerState.currentPlayer.id, playerState.isPlaying, playViaIframe]); // Set source when player changes or playing state changes

  // Update iframe source when current player changes (after initialization)
  // This effect is now handled in the initial source effect above to avoid duplicate updates

  const pauseViaIframe = useCallback(() => {
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
  }, []);

  const play = useCallback(() => {
    // Ensure iframe is ready before playing
    if (iframeRef.current && iframeInitializedRef.current) {
      playViaIframe();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [playViaIframe]);

  const pause = useCallback(() => {
    pauseViaIframe();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, [pauseViaIframe]);

  const togglePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playerState.isPlaying, play, pause]);

  const nextTrack = useCallback(() => {
    const currentIndex = MUSIC_PLAYERS.findIndex(p => p.id === playerState.currentPlayer.id);
    const nextIndex = (currentIndex + 1) % MUSIC_PLAYERS.length;
    const wasPlaying = playerState.isPlaying;
    
    // Temporarily disable auto-advance to prevent double-advance
    autoAdvanceEnabledRef.current = false;
    pause();
    setPlayerState(prev => ({ ...prev, currentPlayer: MUSIC_PLAYERS[nextIndex] }));
    
    // Re-enable auto-advance after a short delay
    setTimeout(() => {
      autoAdvanceEnabledRef.current = true;
    }, 1000);
    
    // Auto-play next track if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        play();
      }, 500);
    }
  }, [playerState.currentPlayer.id, playerState.isPlaying, play, pause]);
  
  // Update ref when nextTrack changes
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const previousTrack = useCallback(() => {
    const currentIndex = MUSIC_PLAYERS.findIndex(p => p.id === playerState.currentPlayer.id);
    const prevIndex = currentIndex === 0 ? MUSIC_PLAYERS.length - 1 : currentIndex - 1;
    const wasPlaying = playerState.isPlaying;
    
    pause();
    setPlayerState(prev => ({ ...prev, currentPlayer: MUSIC_PLAYERS[prevIndex] }));
    
    // Auto-play previous track if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        play();
      }, 500);
    }
  }, [playerState.currentPlayer.id, playerState.isPlaying, play, pause]);

  const setCurrentPlayer = useCallback((player: MusicPlayerConfig) => {
    const wasPlaying = playerState.isPlaying;
    pause();
    setPlayerState(prev => ({ ...prev, currentPlayer: player }));
    if (wasPlaying) {
      setTimeout(() => {
        play();
      }, 500);
    }
  }, [playerState.isPlaying, play, pause]);

  return (
    <MusicPlayerContext.Provider
      value={{
        playerState,
        play,
        pause,
        togglePlayPause,
        nextTrack,
        previousTrack,
        setCurrentPlayer,
        iframeRef,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}

