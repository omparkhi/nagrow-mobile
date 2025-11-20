import { View } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { clearCart } from "@/redux/slices/cart/cartSlice";
import { useDispatch } from "react-redux";

export default function RazorpayWebView() {
    const dispatch = useDispatch();
    const {
        order_Id,
        orderId,
        amount,
        userName,
        userEmail,
        userPhone,
        cartData
    } = useLocalSearchParams();

    const htmlContent = `
        <html>
        <body onload="openRazorpay()">
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <script>
                var options = {
                    key: "${process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID}",
                    amount: ${Number(amount)},
                    currency: "INR",
                    name: "Nagrow",
                    description: "Order Payment",
                    order_id: "${order_Id}",
                    orderId: "${orderId}",
                    prefill: {
                        name: "${userName}",
                        email: "${userEmail}",
                        contact: "${userPhone}"
                    },
                    handler: function (response) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            event: "success",
                            data: response
                        }));
                    },
                    modal: {
                        ondismiss: function(){
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                event: "cancel"
                            }));
                        }
                    }
                };
                function openRazorpay() {
                    var rzp = new Razorpay(options);
                    rzp.open();
                }
            </script>
        </body>
        </html>
    `;

    const handleMessage = async (event) => {
        const paymentData  = JSON.parse(event.nativeEvent.data);

        if (paymentData.event === "cancel") {
            router.back();
            return;
        }

         console.log("FRONTEND PAYMENT DATA:", paymentData.data);

        if (paymentData.event === "success") {
            try {
                
            
            const verifyRes = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/api/payment/verify`,
                {
                    ...paymentData.data,
                    orderData: JSON.parse(cartData)
                }
            );

           


            


            if (verifyRes.data.success) {
                dispatch(clearCart());
                router.replace({
                    pathname: "/user/order/order-success",
                    params: {
                        id: verifyRes.data.order._id,
                        orderId: verifyRes.data.order.orderId,
                        paymentType: "online",
                        paymentId: paymentData.data.razorpay_payment_id,
                        razorpayOrderId: paymentData.data.razorpay_order_id,
                        totalAmount: verifyRes.data.order.totalAmount,
                        paymentStatus: verifyRes.data.order.paymentStatus
                    }
                });
            } else {
                router.back();
            }
            } catch (err) {
        console.log(
            "VERIFY ERROR RESPONSE:",
            err.response?.data || err.message
        );
        router.back();
    }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <WebView
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                javaScriptEnabled
                onMessage={handleMessage}
            />
        </View>
    );
}