import { useRef } from "react";

export function useReelPlayers({ isMuted, thumbAt }) {
  const playersRef = useRef({});
  const iframesRef = useRef({});
  const lastSyncedIndexRef = useRef(null);

  const managePlayers = (activeIndex) => {
    Object.keys(iframesRef.current).forEach((key) => {
      const idx = Number(key);
      const player = playersRef.current[idx];
      const iframe = iframesRef.current[idx];

      if (idx === activeIndex) {
        if (player) {
          if (lastSyncedIndexRef.current !== idx) {
            player.setCurrentTime(0);
            lastSyncedIndexRef.current = idx;
          }
          isMuted ? player.mute() : player.unmute();
          player.play();
        } else {
          iframe?.contentWindow?.postMessage({ method: "play" }, "*");
        }
      } else {
        player?.pause();
        player?.mute();
        iframe?.contentWindow?.postMessage({ method: "pause" }, "*");
      }
    });
  };

  const initPlayer = (iframe, idx) => {
    if (!iframe || !window.playerjs) return;
    if (iframesRef.current[idx]) return;

    iframesRef.current[idx] = iframe;
    playersRef.current[idx] = new window.playerjs.Player(iframe);
  };

  // ✅ MOVED HERE
  const handleOverlayClick = (activeIndex) => {
    const player = playersRef.current[activeIndex];
    if (!player) return;

    player.getPaused((paused) => {
      paused ? player.play() : player.pause();
    });
  };

  return {
    initPlayer,
    managePlayers,
    handleOverlayClick, // exposed to component
    playersRef
  };
}
