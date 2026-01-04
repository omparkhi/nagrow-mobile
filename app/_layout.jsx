import { Stack, useNavigation } from "expo-router";
import { useDispatch } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";
// import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import RootWrapper from "./rootWrapper";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useEffect, useState } from "react";
import ViewOnMapPage from "./user/address/view-map-page";
import { ToastProvider } from "./ToastContext";
import { Alert } from "react-native";
import { getMessaging } from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectSocket } from "@/services/connectSocket";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { GlobalLoaderProvider } from "./context/GlobalLoaderContext";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// import { ScrollProvider } from "./NavContext";

SplashScreen.preventAutoHideAsync();

// 1. CONFIGURE NOTIFICATION BEHAVIOR
// This decides how notifications behave when the app is in Foreground.
// We set specific settings to allow Socket to take over priority when open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // FALSE because we use Custom Toast/Socket in foreground
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 2. BACKGROUND HANDLER (Keep this outside component)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background Notification:', remoteMessage);
});

// 2. ROOT LAYOUT COMPONENT
export default function RootLayout() {
  // useEffect(() => {
  //   async function getToken() {
  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (enabled) {
  //       const fcmToken = await messaging().getToken();
  //       if (fcmToken) {
  //         console.log('FCM Token:', fcmToken);
  //         Alert.alert('FCM Token', fcmToken); // You’ll see a token popup
  //       } else {
  //         console.log('Failed to get FCM token');
  //       }
  //     } else {
  //       console.log('Permission denied for notifications');
  //     }
  //   }
  //   getToken();
  // }, []);

  const [loaded] = useFonts({
    "Nunito": require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Regular": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf")
  });


  //connect socket at one time 
  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
         // Just call it. The singleton logic ensures we don't duplicate.
         connectSocket(token);
      }
    };
    initSocket();

    // Cleanup on unmount (optional, but good for full restarts)
    // return () => disconnectSocket(); 
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

   if (!loaded) return null;

  return (
    <>
      <GestureHandlerRootView>
      <BottomSheetModalProvider>
      <GestureHandlerRootView>
      <RootWrapper bg="#ffffffff" topSafeAreaColor="black" bottomSafeAreaColor="white"  barStyle="light" >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
          <ToastProvider>
              <Stack screenOptions={{ 
                  headerShown: false,
                  animation: "slide_from_right",
                  gestureEnabled: true,
                  gestureDirection: "horizontal"
                }} 
              />  
          </ToastProvider>
          </PersistGate>
        </Provider>
      </RootWrapper>
      </GestureHandlerRootView>
      </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
} 
