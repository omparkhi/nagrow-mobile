import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Alert } from "react-native";
import { clearCart } from "@/redux/slices/cart/cartSlice";
import { useRouter } from "expo-router";
import { Contact, Currency } from "lucide-react-native";

export default function usePayment ({ cart, user, restaurantId, userId, setBackendTotals, backendTotals, selectedAddress }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const handlePaymentOnline = async () => {
        try {
            const cartData = {
                restaurantId,
                userId,
                items: cart.items,
                tip: cart.tip,
                distanceKm: backendTotals.distanceKm,
                deliveryFee: backendTotals.deliveryFee,
                deliveryAddress: {
                    formattedAddress: selectedAddress.formattedAddress,
                    coordinates: selectedAddress.coordinates.coordinates,
                },
            };

            const { data } = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/api/payment/order`,
                cartData
            );

            const { order, totalAmount, distanceKm, subTotal, deliveryFee } = data;

             // Step 3: add totalAmount NOW
            const finalCartData = {
                ...cartData,
                totalAmount
            };

            setBackendTotals({
                totalAmount,
                deliveryFee,
                subTotal,
                distanceKm,
            });

            // navigate to webview
            router.push({
                pathname: "/payment/razorpay-webview",
                params: {
                    order_Id: order.id,
                    orderId: order.orderId,
                    amount: order.amount,
                    userName: user.name,
                    userEmail: user.email,
                    userPhone: user.phone,
                    cartData: JSON.stringify(finalCartData),
                }
            });


            // Native Razorpay Checkout
            // const RazorpayCheckout = require("react-native-razorpay").default;
            // const options = {
            //     description: "Food Order Payment",
            //     currency: "INR",
            //     key: process.env.EXPO_RAZORPAY_KEY_ID,
            //     amount: order.amount,
            //     name: "Nagrow",
            //     order_id: order.id,
            //     prefill: {
            //         email: user.email,
            //         contact: user.phone.toString(),
            //         name: user.name,
            //     },
            //     theme: { color: "#e2832bff" },
            // };

            // RazorpayCheckout.open(options)
            //     .then(async (response) => {
            //         const verifyRes = await axios.post(
            //             `${process.env.EXPO_PUBLIC_API_URL}/api/payment/verify`,
            //             {
            //                 ...response,
            //                 orderData: {
            //                     ...cartData,
            //                     totalAmount: order.amount / 100,
            //                 }
            //             }
            //         );
            //         console.log("Navigate State:", verifyRes.data);

            //         if (verifyRes.data.success) {
            //             dispatch(clearCart());
            //             router.push("/user/order/order-success", {
            //                 id: verifyRes.data.order._id,
            //                 orderId: verifyRes.data.orderId,
            //                 paymentType: "online",
            //                 paymentId: response.razorpay_payment_id,
            //                 razorpayOrderId: response.razorpay_order_id,
            //                 totalAmount: order.amount / 100,
            //                 paymentStatus: verifyRes.data.order.paymentStatus,
            //             });
            //         } else {
            //             Alert.alert("Payment verification failed");
            //         }

                // })
                // .catch((err) => {
                //     console.log("Razorpay Error:", err);
                //     Alert.alert("Payment failed");
                // });
        } catch (err) {
            console.log("Payment Error:", err);
            Alert.alert("Something went wrong while processing payment!");
        }
    };

    const handleOrderCod = async () => {
        try {
            const codOrder = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/payment/order/cod`, {
                userId: userId,
                restaurantId: restaurantId,
                items: cart.items,
                tip: cart.tip,
                deliveryAddress: {
                    formattedAddress: selectedAddress.formattedAddress,
                    coordinates: selectedAddress.coordinates.coordinates,
                },
                distanceKm: backendTotals.distanceKm,
                deliveryFee: backendTotals.deliveryFee,
            }); 

            if (codOrder.data.success) {
                dispatch(clearCart());
                router.push("/user/order/order-success", {
                    id: codOrder.data.order._id,
                    orderId: codOrder.data.order.orderId,
                    paymentType: "cod",
                    totalAmount: codOrder.data.order.totalAmount,
                    paymentStatus: codOrder.data.order.paymentStatus,
                });
            }
        } catch (err) {
            console.log("Error in COD order", err);
            Alert.alert("Something went wrong while placing COD order!");
        }
    };

    return { handlePaymentOnline, handleOrderCod };
};