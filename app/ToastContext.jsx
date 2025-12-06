import React, { createContext, useContext, useState, useCallback } from "react";
import { View, Animated, StyleSheet } from "react-native";
import NagrowToast from "./toast/NagrowToast";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [animation] = useState(new Animated.Value(0));

  const showToast = useCallback((text1, text2, duration = 8000) => {
    setToast({ text1, text2 });

    // Animate in
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide
    setTimeout(() => {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 50], // slide from top
                  }),
                },
              ],
            },
          ]}
        >
          <NagrowToast text1={toast.text1} text2={toast.text2} />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 9999,
  },
});
