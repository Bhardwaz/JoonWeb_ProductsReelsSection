import { useEffect, useState } from "react";

export const usePlayerJsLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.playerjs) {
      setIsLoaded(true);
      return;
    }

    const existing = document.getElementById("playerjs-script");
    if (existing) {
      existing.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "playerjs-script";
    script.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
    script.async = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Failed to load PlayerJS");

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  return { isLoaded, error };
};
