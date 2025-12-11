import React, { useState } from "react";
import { useItems } from "../context/api";
const ThumbContext = React.createContext();

export const ThumbProvider = ({ children }) => {
  const [thumbAt, setThumbAt] = useState(0);
  const items = useItems()?.items || [];

  const nextThumb = () => {
    const len = items?.length || 0;
    if (len === 0) return;
    setThumbAt((prev) => (prev + 1) % len);
  };

  const prevThumb = () => {
    console.log("came here")
    const len = items?.length || 0;
    if (len === 0) return;
    setThumbAt((prev) => (prev - 1 + len) % len);
  };

  const setThumb = (index) => setThumbAt(index);

  return (
    <ThumbContext.Provider value={{ thumbAt, nextThumb, prevThumb, setThumb }}>
      {children}
    </ThumbContext.Provider>
  );
};

export const useThumb = () => React.useContext(ThumbContext);
