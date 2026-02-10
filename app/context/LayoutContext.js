// context/LayoutContext.js
import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [isImmersive, setIsImmersive] = useState(false);
  const [bottomSafeColor, setBottomSafeColor] = useState("white");

  return (
    <LayoutContext.Provider value={{ 
        isImmersive, 
        setIsImmersive, 
        bottomSafeColor, 
        setBottomSafeColor 
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// Custom Hook for easy access
export const useLayoutConfig = () => useContext(LayoutContext);