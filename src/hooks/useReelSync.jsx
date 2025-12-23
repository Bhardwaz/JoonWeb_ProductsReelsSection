import { useEffect } from "react";

export function useReelSync({ thumbAt, swiperInstance, managePlayers }) {
  useEffect(() => {
    if (swiperInstance && swiperInstance.activeIndex !== thumbAt) {
      swiperInstance.slideTo(thumbAt);
    }
    managePlayers(thumbAt);
  }, [thumbAt, swiperInstance]);
}
