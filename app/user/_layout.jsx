// app/user/_layout.jsx
import { Slot } from "expo-router";
import ProtectedRoute from "./protectedRoute";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartSummaryBar from "./cart/cart-bar";
import { fetchUser } from "@/redux/slices/user/authSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";


export default function UserLayout() {
  const dispatch = useDispatch();
  
    useEffect(() => {
      dispatch(fetchUser());
    }, []);
  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.cartWrapper}>
        <CartSummaryBar />
      </SafeAreaView>
      <Slot /> 
       {/* renders /user/index.jsx or /user/profile.jsx */}
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  cartWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: "center",
  },
});
