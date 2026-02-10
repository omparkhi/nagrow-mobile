import { View, ActivityIndicator, StyleSheet, Text, Alert } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { useLocalSearchParams, router } from "expo-router"; // Use standard router
import { clearCart } from "@/redux/slices/cart/cartSlice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import AppText from "@/components/AppText"; // Assuming you have this, or use Text

export default function RazorpayWebView() {
    const dispatch = useDispatch();
    
    // State to manage the UI phases
    const [status, setStatus] = useState("IDLE"); // IDLE | VERIFYING | COMPLETED
    
    const {
        orderId, orderNo, amount, userName, userEmail, userPhone, cartData
    } = useLocalSearchParams();

    const htmlContent = `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .text {
      font-size: 18px;
      font-weight: 600;
      color: #111;
    }

    .sub {
      margin-top: 6px;
      font-size: 13px;
      color: #666;
    }

    .loader {
      margin-top: 14px;
      width: 24px;
      height: 24px;
      border: 3px solid #e0e0e0;
      border-top: 3px solid #00C569;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
            </style>
        </head>
        <body onload="openRazorpay()">
            <div class="container">
                <div class="text">Initializing Payment</div>
                <div class="sub">Do not press back</div>
                <div class="loader"></div>
            </div>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <script>
                var options = {
                    key: "${process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID}",
                    amount: ${Math.round(Number(amount) * 100)},
                    currency: "INR",
                    name: "Nagrow",
                    description: "Order Payment",
                    order_id: "${orderId}",
                    orderNo: "${orderNo}",
                    prefill: { name: "${userName}", email: "${userEmail}", contact: "${userPhone}" },
                    handler: function (response) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ event: "success", data: response }));
                    },
                    modal: {
                        ondismiss: function(){
                            window.ReactNativeWebView.postMessage(JSON.stringify({ event: "cancel" }));
                        }
                    }
                };
                function openRazorpay() { var rzp = new Razorpay(options); rzp.open(); }
            </script>
        </body>
        </html>
    `;

    const handleMessage = async (event) => {
        // If we are already verifying or done, ignore messages
        if (status !== "IDLE") return;

        let paymentData;
        try {
            paymentData = JSON.parse(event.nativeEvent.data);
        } catch (e) { return; }

        if (paymentData.event === "cancel") {
            router.back();
            return;
        }

        if (paymentData.event === "success") {
            // 1. KILL THE WEBVIEW INSTANTLY
            // By setting status to 'VERIFYING', the render method below 
            // will switch from <WebView> to <View (Loader)>. 
            // This frees up the JS thread immediately.
            setStatus("VERIFYING");

            try {
                let parsedCartData = typeof cartData === 'string' ? JSON.parse(cartData) : cartData;

                const verifyRes = await axios.post(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/payment/verify`,
                    { ...paymentData.data, orderData: parsedCartData },
                    { timeout: 15000 }
                );

                if (verifyRes.data.success && verifyRes.data.order) {
                    dispatch(clearCart());
                    setStatus("COMPLETED"); // Optional, just for safety

                    // 2. Safe Navigation using standard Router
                    // Since WebView is gone, this won't freeze.
                    router.replace({
                        pathname: `/user/order/${verifyRes.data.order._id}`,
                        params: {
                            orderNo: verifyRes.data.order.orderNo,
                            paymentType: "online",
                            paymentId: paymentData.data.razorpay_payment_id,
                            totalAmount: verifyRes.data.order.totalAmount,
                            paymentStatus: verifyRes.data.order.paymentStatus
                        }
                    });

                } else {
                    throw new Error("Verification failed");
                }
            } catch (err) {
                console.log("ERROR:", err);
                Alert.alert("Payment Error", "Verification failed. Check your orders tab.", [
                    { text: "OK", onPress: () => router.replace('/user/home') } // Fallback to home
                ]);
            }
        }
    };

    // --- CONDITIONAL RENDERING ---

    // 1. IF VERIFYING: Show full screen loader (WebView is Unmounted/Killed)
    if (status === "VERIFYING" || status === "COMPLETED") {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00C569" />
                <Text style={styles.text}>Payment Received!</Text>
                <Text style={styles.subText}>Confirming your order...</Text>
            </View>
        );
    }

    // 2. IF IDLE: Show WebView
    return (
        <View style={{ flex: 1 }}>
            <WebView
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                javaScriptEnabled
                onMessage={handleMessage}
                androidHardwareAccelerationDisabled={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    text: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    subText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666'
    }
});