import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Animated, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // CRITICAL IMPORT
import NagrowToast from "./toast/NagrowToast"; // Adjust path

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  // Using useRef ensures the animation value persists correctly across renders
  const animation = useRef(new Animated.Value(0)).current; 
  const insets = useSafeAreaInsets(); // Get dynamic notch height

  const showToast = useCallback((text1, text2, action = null, duration = 4000) => {
    setToast({ text1, text2, action });

    // 1. Spring Animation (Bouncy effect like Swiggy)
    Animated.spring(animation, {
      toValue: 1,
      friction: 8, // Controls the "bounciness"
      tension: 40, // Controls the speed
      useNativeDriver: true,
    }).start();

    // 2. Auto Hide
    setTimeout(() => {
      hideToast();
    }, duration);
  }, []);

  const hideToast = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToast(null));
  };

  // Calculate top padding based on device (Notch vs No Notch)
  const topPadding = Platform.OS === 'ios' ? insets.top + 10 : 0;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: topPadding, // Dynamic top position
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-150, 0], // Starts 150px above its final position
                  }),
                },
              ],
              opacity: animation, // Fade in effect combined with slide
            },
          ]}
        >
          <NagrowToast 
            text1={toast.text1} 
            text2={toast.text2} 
            onPress={() => {
                if (toast.action) toast.action();
                hideToast(); // Close toast on click
            }}
          />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999, // Ensures it sits above everything
    elevation: 10, // Android z-index equivalent
  },
});