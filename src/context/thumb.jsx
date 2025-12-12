import React, { useState } from "react";
const ThumbContext = React.createContext();

export const ThumbProvider = ({ children }) => {
  const [thumbAt, setThumbAt] = useState(0);

  const nextThumb = (len) => {
    if (len === 0 || len === undefined) return;
    setThumbAt((prev) => (prev + 1) % len);
  };

  const prevThumb = (len) => {
    if (len === 0 || len === undefined) return;
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
