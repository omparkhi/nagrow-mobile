import React, { createContext, useState, useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const GlobalLoaderContext = createContext();

export const GlobalLoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <GlobalLoaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <View style={styles.overlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#c56600ff" />
          </View>
        </View>
      )}
    </GlobalLoaderContext.Provider>
  );
};

export const useGlobalLoader = () => useContext(GlobalLoaderContext);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Light dim
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    justifyContent: "center",
    alignItems: "center",
  }
});