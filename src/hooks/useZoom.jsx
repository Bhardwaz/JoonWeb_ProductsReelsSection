import { useEffect, useState } from "react";

export function useZoom() {
  const [zoom, setZoom] = useState(window.devicePixelRatio);

  useEffect(() => {
    const onChange = () => {
      setZoom(window.devicePixelRatio);
    };

    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []);
  
  return zoom;
}
