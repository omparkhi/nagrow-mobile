import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getCart, getGrandTotal, getTotalItems, clearCart } from "@/redux/slices/cart/cartSlice";
import { Trash } from "lucide-react-native";
import AppText from "@/components/AppText";
import { useRouter, useSegments } from "expo-router";

const CartSummaryBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();

  const cart = useSelector(getCart);
  const grandTotal = useSelector(getGrandTotal);
  const totalItem = useSelector(getTotalItems);

  const items = cart?.items || [];
  const restaurantId = cart?.restaurantId;
  
  const currentPath = "/" + segments.join("/");

  // console.log("CURRENT PATH:", currentPath);

  // Current screen check
  const isCartPage = currentPath === "/user/cart/cart-page";

  if (isCartPage) return null;
  if (!items || items.length === 0) return null;

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <AppText variant="small" style={styles.items}>
          {totalItem} item{totalItem > 1 ? "s" : ""}
        </AppText>

        <AppText variant="small" style={styles.total}>₹{grandTotal}</AppText>

        <TouchableOpacity
          onPress={() =>
            // navigation.navigate("Cart", { restaurantId })
            router.push("/user/cart/cart-page")
          }
          style={styles.button}
        >
          <AppText variant="small" style={styles.buttonText}>View Cart</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
          <Trash color="red" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartSummaryBar;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: "center",
    gap: 15,
  },
  items: {
    fontSize: 14,
  },
  total: {
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
  },
  clearBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#e5e5e5",
  },
});
