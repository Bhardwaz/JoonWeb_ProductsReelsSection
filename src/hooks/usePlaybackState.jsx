// hooks/usePlaybackState.js
import { useState, useCallback, useEffect } from 'react';

export const usePlaybackState = (playerManager, currentIndex, playerJsReady) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlaybackIcon, setShowPlaybackIcon] = useState(false);

  useEffect(() => {
    if (!playerJsReady) return;

    const player = playerManager.getPlayer(currentIndex);
    if (!player) {
      setIsPlaying(true);
      return;
    }

    // Get current playback state
    const updatePlaybackState = () => {
      player.getPaused((isPaused) => {
        const playing = !isPaused;
        setIsPlaying(playing);
        
        // Show icon briefly when state changes
        if (!playing) {
          setShowPlaybackIcon(true);
          setTimeout(() => setShowPlaybackIcon(false), 1000);
        }
      });
    };

    // Listen to play/pause events
    const onPlay = () => {
      setIsPlaying(true);
      setShowPlaybackIcon(false);
    };

    const onPause = () => {
      setIsPlaying(false);
      setShowPlaybackIcon(true);
    };

    player.on('play', onPlay);
    player.on('pause', onPause);
    
    // Get initial state
    updatePlaybackState();

    return () => {
      player.off('play', onPlay);
      player.off('pause', onPause);
    };
  }, [currentIndex, playerJsReady, playerManager]);

  // Show icon when manually toggling
  const togglePlayPauseWithIcon = useCallback(async () => {
    const player = playerManager.getPlayer(currentIndex);
    if (!player) return;

    player.getPaused((isPaused) => {
      if (isPaused) {
        playerManager.safePlay(player);
        setIsPlaying(true);
        setShowPlaybackIcon(false);
      } else {
        player.pause();
        setIsPlaying(false);
        setShowPlaybackIcon(true);
        
        // Hide icon after 1.5 seconds
        setTimeout(() => {
          setShowPlaybackIcon(false);
        }, 1500);
      }
    });
  }, [currentIndex, playerManager]);

  return {
    isPlaying,
    showPlaybackIcon,
    setIsPlaying,
    setShowPlaybackIcon,
    togglePlayPauseWithIcon,
  };
};