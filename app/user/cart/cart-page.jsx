import React, { useEffect, useState } from "react";
import { fetchRestaurantById } from "@/redux/slices/user/restaurantSlice";
import { useDispatch, useSelector } from "react-redux";
import RestaurantHeader from "../restaurant/header";
import {getRestaurant, increment, decrement, getSubtotal, getCart, getGrandTotal, getDeliveryFee,  } from "@/redux/slices/cart/cartSlice";
import MenuSection from "./menu-section";
import BillSection from "./bill-section";
import PaymentOptions from "./payment-option";
import DeliveryAddress from "./delivery-address";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { View } from "react-native";
import usePayment from "@/services/paymentService";
import NoCartFound from "./no-cart-found";
import { ScrollView, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native";
import AppText from "@/components/AppText";
import LottieView from "lottie-react-native";
import CheckoutLoader from "@/assets/checkout-loader.json";
import { useLocalSearchParams } from "expo-router";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import RootWrapper from "@/app/rootWrapper";
import PaymentBar from "./payment-bar";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";


export default function CartPage () {
  const router = useRouter();
  const { setVisible } = useBottomBarVisibility();
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [addressReady, setAddressReady] = useState(false);
  const [method, setMethod] = useState("online");
  const restaurantId = useSelector((state) => state.cart.restaurantId);

    const dispatch = useDispatch();
    // const restaurant = useSelector(getRestaurant);
    const items = useSelector((state) => state.cart.items);
    const { restaurant, menu, loading } = useSelector((state) => state.restaurants);
  //  const userId = useSelector((state) => state.auth.user?._id);
    const user = useSelector((state) => state.auth.user);
    // console.log("user: ", user);
    // const localStorageId = AsyncStorage.getItem("userId");
    // console.log("🔍 REDUX USER OBJECT:", JSON.stringify(user, null, 2));
    const userId = user?._id ;

    // const restaurantId = restaurant?._id;

    console.log("CartPage route id:", restaurantId);


    const { selectedAddress } = useSelector(
    (state) => state.address
  );

    useEffect(() => {
      setVisible(false);     // Hide header
      return () => setVisible(true);  // Show header again when leaving page
    }, []);

useEffect(() => {
  setAddressReady(!!selectedAddress);
}, [selectedAddress]);


useEffect(() => {
  if (!restaurantId) return;
  dispatch(fetchRestaurantById(restaurantId));
}, [restaurantId, dispatch]);

// useEffect(() => {
//   console.log("restaurant updated:", restaurant);
// }, [restaurant]);


  // if (error) {
  //   return <AppText style={styles.errorText}>{error}</AppText>;
  // }

  


    const [backendTotals, setBackendTotals] = useState({
      totalAmount: 0,
      subTotal: 0,
      distanceKm: 0,
      deliveryFee: 0,
    })

    const handleAddItem = async (menuItem) => {
      const resultAction = await dispatch(
        addToCartThunk({
          menuItem, 
          restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
        },
        })
      );
    
      const result = resultAction.payload;
    
      if (result?.conflict) {
        Alert.alert(
          "Different Restaurant",
          `Your cart has items from ${result.currentRestaurant}. Clear cart?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Clear",
              onPress: async () => {
                await dispatch(clearCart());
    
                awaitdispatch(
                  addToCartThunk({
                    menuItem, 
                    restaurant: {
                      _id: restaurant._id,
                      name: restaurant.name,
                    },
                  })
                );
              },
            },
          ]
        );
      }
    };

    const cart = useSelector(getCart);
    const subtotal = useSelector(getSubtotal);
    const grandTotal =  useSelector((state) => 
      getGrandTotal(state, backendTotals.distanceKm)
    );
    const deliveryFee = useSelector((state) => 
      getDeliveryFee(state, backendTotals.distanceKm)
    );

    // delivery fee using distance Matrix api 
    useEffect(() => {
      console.log("userid: ", userId, "restaurantId: ", restaurantId)
      if (!userId || !restaurantId) return;
  //     if (!userId || !restaurantId) {
  //   console.log("Missing IDs => ", { userId, restaurantId });
  //   return;
  // }

      const fetchDelivery = async () => {
        
          if (!userId || !restaurantId) {
            
            setDeliveryLoading(false);
            return;
          }
        try {
          setDeliveryLoading(true);
          // console.log("Delivery API Payload =>", { userId, restaurantId });

          const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/payment/cal/deliveryFee`,
            { userId, restaurantId }
          );

          if (data.success) {
            setBackendTotals({
              distanceKm: data.distanceKm,
              deliveryFee: data.deliveryFee,
            });
          }
        } catch (err) {
            console.error("Delivery calc error:", err);
        } finally {
          setDeliveryLoading(false);
        }
      };

      fetchDelivery();
    }, [userId, restaurantId]);

    const { handlePaymentOnline, handleOrderCod } = usePayment({
      cart,
      user,
      restaurantId,
      userId,
      grandTotal,
      setBackendTotals,
      backendTotals,
      selectedAddress,
    });


    useEffect(() => {
  if (cart.items.length === 0) {
    setBackendTotals({
      totalAmount: 0,
      subTotal: 0,
      distanceKm: 0,
      deliveryFee: 0,
    });
    setMethod("online");
  }
}, [cart.items.length]);

const isCheckoutLoading =
  loading ||
  !restaurant ||
  !addressReady ||
  deliveryLoading;
console.log("loading", loading, restaurant === restaurant, addressReady, deliveryLoading)

if (isCheckoutLoading) {
  return (
    <View style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <LottieView
        source={CheckoutLoader}
        autoPlay
        loop
        style={{ width: 100, height: 100 }}
      />
    </View>
  )
}

// if (loading) {
//     return (
//       <View>
//         <ActivityIndicator size="small" color="#ff5733" />
//         <AppText >loading address ...</AppText>
//       </View>
//     );
//   }

// if (!selectedAddress) {
//     return <AppText >No address found</AppText>;
//   }

if (!cart.items.length) return <NoCartFound />;


    return (
        <View style={{ flex: 1 }}>
            {/* <RestaurantHeader restaurant={restaurant} /> */}
            {/* <RootWrapper bg="#ffffffff" topSafeAreaColor="white" bottomSafeAreaColor="white"  barStyle="light" > */}
          <View style={styles.pageHeader} >
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 15 }}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={23} color="#747474ff" />
              </TouchableOpacity>
                <AppText variant="light" style={styles.pageTitle}>{restaurant.name}</AppText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: -5, gap: 5, marginLeft: 26 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16, }}>
                <MaterialIcons name="home" size={20} color="#000"  />
              </TouchableOpacity>
                <AppText variant="small" style={{ color: "#000" }}>Home | <AppText variant="light" style={{ color: "#464646ff", fontSize: 12 }}>{selectedAddress.fullAddress}</AppText></AppText>

            </View>
          </View>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ marginHorizontal: 15, marginBottom: 50 }}>
              <MenuSection items={items} increment={(id) => dispatch(increment(id))} decrement={(id) => dispatch(decrement(id))} handleAddItem={handleAddItem} restaurantId={restaurantId} />
              <DeliveryAddress selectedAddress={selectedAddress} />
              <PaymentOptions method={method} setMethod={setMethod} onPayOnline={handlePaymentOnline} onPayCOD={handleOrderCod}/>
              <BillSection subtotal={subtotal} deliveryFee={deliveryFee} distanceKm={backendTotals.distanceKm} grandTotal={grandTotal} backendTotals={backendTotals} tip={cart.tip}  />
            </View>
          </ScrollView>
          <View style={{ zIndex: 9999, elevation: 10 }}>
            <PaymentBar method={method} onPayOnline={handlePaymentOnline} onPayCOD={handleOrderCod} grandTotal={grandTotal}/>
          </View>
              
          
          {/* </RootWrapper> */}
        </View>
    )
}

const styles = StyleSheet.create({
  pageHeader: {
    backgroundColor: "#fff",
      paddingVertical: 12,
        // marginTop: -30,
        // height: 120,
        // paddingHorizontal: 16,
        flexDirection: "column",
        // alignItems: "center",
    },
    subpageHeader: {
        position: "absolute",
        // height: 50,
        width: "80%",
        marginTop: 80,
        // marginLeft: -40,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: "row",
        // gap: 10,
        alignItems: "center",
        borderRadius: 5,
    },
    pageTitle: {
      marginLeft: 8,
        fontSize: 13,
        color: "#464646ff",
        textTransform: "capitalize"
    },
    pageSubtitle: {
        fontSize: 12,
        color: "#141414",
    },
})