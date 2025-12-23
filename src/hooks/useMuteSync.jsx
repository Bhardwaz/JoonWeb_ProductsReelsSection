import { useEffect } from "react";

export function useMuteSync({ isMuted, activeIndex, playersRef }) {
  useEffect(() => {
    const player = playersRef.current[activeIndex];
    if (!player) return;
    isMuted ? player.mute() : player.unmute();
  }, [isMuted, activeIndex]);
}
