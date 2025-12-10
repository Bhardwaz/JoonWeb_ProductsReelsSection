import React, { useState } from "react";

const ThumbContext = React.createContext();

export const ThumbProvider = ({ children }) => {
  const [thumbAt, setThumbAt] = useState(0);

  const nextThumb = () => setThumbAt((prev) => prev + 1);
  const prevThumb = () => setThumbAt((prev) => (prev > 0 ? prev - 1 : 0));
  const setThumb = (index) => setThumbAt(index);

  return (
    <ThumbContext.Provider value={{ thumbAt, nextThumb, prevThumb, setThumb }}>
      { children }
    </ThumbContext.Provider>
  );
};

export const useThumb = () => React.useContext(ThumbContext);
