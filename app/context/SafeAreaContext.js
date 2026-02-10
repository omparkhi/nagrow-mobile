import React, { createContext, useContext, useState } from "react";

const SafeAreaContext = createContext(null);

export function SafeAreaProvider({ children }) {
  const [barStyle, setBarStyle] = useState("light");

  return (
    <SafeAreaContext.Provider value={{ barStyle, setBarStyle }}>
      {children}
    </SafeAreaContext.Provider>
  );
}

export function useSafeAreaController() {
  return useContext(SafeAreaContext);
}
