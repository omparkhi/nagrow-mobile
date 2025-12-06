import { Slot } from "expo-router";
import { fetchResProfile } from "@/redux/slices/restaurant/authSlice";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import RestaurantProtectedRoute from "./RestaurantProtectedRoute";
import Header from "./header";
import { connectSocket, getSocket } from "@/services/connectSocket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../ToastContext";
import { playNewOrderSound } from "@/hooks/rest-sound-notification";
import { fetchOrderById } from "@/redux/slices/restaurant/orderSlice";

export default function RestaurantLayout () {
    const { showToast } = useToast();
    const dispatch = useDispatch();
    const { restaurant } = useSelector(state => state.restaurantAuth);
    // const { currentOrder, loading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchResProfile());
    }, []);

    useEffect(() => {
        const initSocket = async () => {
            if (!restaurant?._id) return;

            const restaurantId = await AsyncStorage.getItem("restaurantId");
            const userType = await AsyncStorage.getItem("userType");

            if (!restaurantId || !userType) return;

            const socket = getSocket();

            // console.log("restaurantId:", restaurantId);
            // console.log("userType:", userType);

            socket.emit("joinRoom", { 
                roomType: userType, 
                roomId: restaurantId 
            });

            const handleNewOrder = (data) => {
                console.log("New Order Received:", data);
                playNewOrderSound();
                showToast(`Order ${data.orderId}`, "New Order Received");
                dispatch(fetchOrderById(data._id));
            };

            const handleDeliveryAccept = (data) => {
                playNewOrderSound();
                console.log("📢 Delivery Accepted by rider", data);
                // alert(`Rider Assigned`);
                showToast(`Order ${data.orderId}`,`Rider Assigned`);
                dispatch(fetchOrderById(data.id)); 
            };

            socket.on("order:new", handleNewOrder);
            socket.on("delivery:accepted", handleDeliveryAccept);

            return () => {
                socket.off("order:new", handleNewOrder);
                socket.off("delivery:accepted", handleDeliveryAccept);
            };
        };

        initSocket();
    }, [restaurant]);

           
    return (
        <RestaurantProtectedRoute>
            <Header />
            <Slot />
        </RestaurantProtectedRoute>
    )
}
