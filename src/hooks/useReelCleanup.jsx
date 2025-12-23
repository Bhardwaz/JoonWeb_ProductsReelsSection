import { useEffect } from "react";

export function useReelCleanup(isMobile, playersRef) {
  useEffect(() => {
    Object.values(playersRef.current).forEach(p => {
      try { p.pause(); p.mute(); } catch {}
    });
    playersRef.current = {};
  }, [isMobile]);
}
