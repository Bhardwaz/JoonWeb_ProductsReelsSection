import { useCallback, useRef } from "react"

export const usePlayerManager = () => {
  const playersRef = useRef(new Map())  // set remote of all videos - play, pause and mute
  const activeIndexRef = useRef(-1)

  console.log(playersRef, "players ref")

  const playActiveVideo = useCallback((index, isMuted = false) => {
    playersRef.current.forEach((p, i) => {
      if (i === index) return;

      try {
        p.mute();
      } catch (error) {
        playersRef.current.delete(i);
      }
    });

    const activePlayer = playersRef.current.get(index);

    if (activePlayer) {
      try {
        isMuted ? activePlayer.mute() : activePlayer.unmute();

        activePlayer.play();
        activeIndexRef.current = index;
      } catch (error) {
        playersRef.current.delete(index);
      }
    }
  }, []);

  const pauseVideo = useCallback(index => {
    const player = playersRef.current.get(index);
   
    if (player) player.pause();
  }, [])

  const setActiveIndex = useCallback((index) => {
    activeIndexRef.current = index;
  }, []);

  const getActiveIndex = useCallback(() => activeIndexRef.current, []);

  const applyMuteToAll = useCallback((isMuted) => {
    playersRef.current.forEach((player, index) => {
      if (index === activeIndexRef.current) {
        isMuted ? player?.mute() : player?.unmute()
      }

      try {
        player.mute()
      } catch (error) {
        console.warn(`♻️ Cleaning up stale player ref for Slide ${idx}`);
        playersRef.current.delete(idx);
      }
    });
  }, [])

  const cleanupAllPlayers = useCallback(() => {
    console.log('🧹 Cleaning up all players');
    playersRef.current.forEach((player, index) => {
      try {
        player.pause();
        player.mute();
      } catch (e) {
        // Silent fail on cleanup
      }
    });
    playersRef.current.clear();
    activeIndexRef.current = -1;
  }, []);

  const initPlayer = useCallback((iframe, index) => {
    if (!window.playerjs || !iframe) return null;

    try {
      const player = new window.playerjs.Player(iframe);
      playersRef.current.set(index, player);

      player.on('error', (error) => {
        console.error(`Player ${index} error:`, error);
      });
      return player;
    } catch (error) {
      console.error('Player init error:', error);
      return null;
    }
  }, []);

  const getPlayer = useCallback((index) => {
    return playersRef.current.get(index) || null;
  }, []);

  const getActivePlayer = useCallback(() => {
    return playersRef.current.get(activeIndexRef.current) || null;
  }, []);

  const togglePlayPause = useCallback((index) => {
    const player = getPlayer(index);
    if (!player) return;

    player.getPaused((isPaused) => {
      if (isPaused) {
        player.play();
      } else {
        player.pause();
      }
    });
  }, [getPlayer]);

  const pauseOtherVideos = useCallback((activeIndex) => {
    playersRef.current.forEach((player, idx) => {
      if (idx !== activeIndex) {
        try {
          player.pause();
        } catch (error) {
          // If it fails, remove it
          playersRef.current.delete(idx);
        }
      }
    });
  }, []);

  const getPlayerState = useCallback((index) => {
    const player = getPlayer(index);
    if (!player) return 'uninitialized';

    return new Promise((resolve) => {
      player.getPaused((isPaused) => {
        player.getMuted((isMuted) => {
          resolve({
            isPaused,
            isMuted,
            isActive: index === activeIndexRef.current
          });
        });
      });
    });
  }, [getPlayer]);

  return {
    initPlayer,
    setActiveIndex,
    getActiveIndex,
    playersRef,
    playActiveVideo,
    pauseVideo,
    applyMuteToAll,
    cleanupAllPlayers,
    getActivePlayer,
    togglePlayPause,
    getPlayerState,
    pauseOtherVideos
  };
}