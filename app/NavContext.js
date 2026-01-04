// context/NavContext.js
import React, { createContext, useContext } from 'react';
import { useSharedValue } from 'react-native-reanimated';

const NavContext = createContext(null);

export function NavProvider({ children }) {
  // Shared Value: 0 = Visible, 1 = Hidden
  // We use a shared value so we can animate it instantly from anywhere
  const navTranslateY = useSharedValue(0); 

  return (
    <NavContext.Provider value={navTranslateY}>
      {children}
    </NavContext.Provider>
  );
}

export const useNavAnimation = () => {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNavAnimation must be used within NavProvider");
  return context;
};