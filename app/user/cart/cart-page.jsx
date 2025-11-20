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


export default function CartPage () {
  const [method, setMethod] = useState("online");
  
    const dispatch = useDispatch();
    // const restaurant = useSelector(getRestaurant);
    const items = useSelector((state) => state.cart.items);
    const { restaurant, menu, loading } = useSelector((state) => state.restaurants);
  //  const userId = useSelector((state) => state.auth.user?._id);
    const user = useSelector((state) => state.auth.user);
    // console.log("user: ", user);
    const userId = user?._id;

    const restaurantId = restaurant?._id;

    const { selectedAddress } = useSelector(
    (state) => state.address
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#ff5733" />
        <AppText style={styles.loadingText}>loading address ...</AppText>
      </View>
    );
  }

  // if (error) {
  //   return <AppText style={styles.errorText}>{error}</AppText>;
  // }

  if (!selectedAddress) {
    return <AppText style={styles.noAddress}>No address found</AppText>;
  }


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
      if (!userId || !restaurantId) {
    console.log("Missing IDs => ", { userId, restaurantId });
    return;
  }

      const fetchDelivery = async () => {
        try {
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
        }
      };

      fetchDelivery();
    }, [userId, restaurantId]);

    const { handlePaymentOnline, handleOrderCod } = usePayment({
      cart,
      user,
      restaurantId,
      userId,
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


if (!cart.items.length) return <NoCartFound />;

    return (
        <>
            <RestaurantHeader restaurant={restaurant} />
            <View style={{ marginHorizontal: 10 }}>
              <MenuSection items={items} increment={(id) => dispatch(increment(id))} decrement={(id) => dispatch(decrement(id))} handleAddItem={handleAddItem} restaurantId={restaurantId} />
              <BillSection subtotal={subtotal} deliveryFee={deliveryFee} distanceKm={backendTotals.distanceKm} grandTotal={grandTotal} backendTotals={backendTotals} tip={cart.tip}  />
              <DeliveryAddress selectedAddress={selectedAddress} />
              <PaymentOptions method={method} setMethod={setMethod} onPayOnline={handlePaymentOnline} onPayCOD={handleOrderCod}/>
            </View>
        </>
    )
}