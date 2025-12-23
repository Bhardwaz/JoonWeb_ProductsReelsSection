import { useRef } from "react";

export function useReelSwiper({
  thumbAt,
  nextThumb,
  prevThumb,
  appendNext,
  managePlayers
}) {
  const prevIndexRef = useRef(thumbAt);

  const onSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    const prevIndex = prevIndexRef.current;

    // 🔥 Stop old audio & start new audio immediately
    managePlayers(newIndex);

    // Determine direction
    if (newIndex > prevIndex) {
      nextThumb();
    } else if (newIndex < prevIndex) {
      prevThumb();
    }

    appendNext();
    prevIndexRef.current = newIndex;
  };

  return { onSlideChange };
}
