import { Stack } from "expo-router";
import { useDispatch } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import RootWrapper from "./rootWrapper";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  

  const [loaded] = useFonts({
    "Nunito-Regular": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf")
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

   if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <RootWrapper bg="#000" barStyle="light">
        <Provider store={store}>
          <Stack screenOptions={{ headerShown: false }} />
        </Provider>
      </RootWrapper>
    </SafeAreaProvider>
  );
} 
