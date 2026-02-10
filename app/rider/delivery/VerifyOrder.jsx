import React, { useCallback, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import AppText from "@/components/AppText";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import RootWrapper from "@/app/rootWrapper";
import { useLayoutConfig } from "@/app/context/LayoutContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRiderBottomBarVisibility } from "@/app/context/RiderNavBarVisiblityContext";
import DeliveryActionArea from "./DeliveryActionArea";
import { useDeliveryOrder } from "@/hooks/useDeliveryOrder";
// import { Feather } from "lucide-react-native";

export default function VerifyOrder() {
    const { order, loadingStatus: isUpdating, updateStatus } = useDeliveryOrder();
    const { setIsImmersive, setBottomSafeColor } = useLayoutConfig();
    const insets = useSafeAreaInsets();
    const { setVisible } = useRiderBottomBarVisibility();
    const router = useRouter();

    useEffect(() => {
        setVisible(false);
        return () => setVisible(true);
    }, []);

      useFocusEffect(
        useCallback(() => {
          setIsImmersive(true);
          setBottomSafeColor("white"); // Set bottom bar to white if needed
    
          return () => {
            // 2. When Screen Unfocuses (Navigating away): Reset to Default
            setIsImmersive(false);
            setBottomSafeColor("white");
          };
        }, [])
      );

    const handlecall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handlePickupSlide = async (newStatus) => {
        // 1. Call the API (updateStatus passed from parent hook)
        await updateStatus(newStatus);
        
        // 2. Navigate back to Map Page after update
        handleBack();
    };

    const handleBack = () => {
        if (router.back()) {
            router.back();
        } else {
            router.push("/rider/delivery/order")
        }
    }

    return (
        <RootWrapper immersive={true} barStyle="light" bottombar={true}>
        <View style={{ height: "100%" }}>
            <TouchableOpacity onPress={handleBack} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#16A34A", paddingTop: insets.top + 10, paddingBottom: 10, paddingHorizontal: 12 }}>
                <Ionicons name="arrow-back" size={25} color="#ffffff" />
                <AppText style={{ fontSize: 18, color: "#fff" }}>Picking Order</AppText>
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 12, marginTop: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialCommunityIcons name="store-marker" size={24} color="#666" />
                    <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", color: "#666"}}>Pickup from</AppText>
                </View>
                <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", color: "#666", fontFamily: "Nunito"  }}>Order No # {order?.orderNo || "NAGROW-FRSBS"}</AppText>
                <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", color: "#666"}}>{order?.restaurantId?.name || "Hotel Amber"}</AppText>
            </View>

            <View style={{  marginHorizontal: 12, marginTop: 10, borderWidth: 1, borderColor: "#cbcbcb",  borderRadius: 12,  }}> 
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#cbcbcb", padding: 10, }}>
                    <MaterialCommunityIcons name="clipboard-check-outline" size={24} color="#0f172a" />
                    <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", color: "#0f172a"}}>Verify Order</AppText>
                </View>
                <AppText variant="small" style={{ fontSize: 14, color: "#0f172a", color: "#666",  paddingBottom: 10,  padding: 10,}}>Check and verify the order from order No</AppText>                
            </View>

            <View style={{  marginHorizontal: 12, marginTop: 10, borderWidth: 1, borderColor: "#cbcbcb",  borderRadius: 12,  }}> 
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#cbcbcb", padding: 10, }}>
                    <Ionicons name="receipt-outline" size={24} color="#0f172a" />
                    <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", color: "#0f172a"}}>Item Details</AppText>
                </View>
                {/* <AppText variant="small" style={{ fontSize: 14, color: "#0f172a", color: "#666",  paddingBottom: 10, marginTop: 5, padding: 6,}}>Check and verify the order from order No</AppText>*/}

                <View>
                    {order?.items.map((i) => (
                        <View key={order?._id}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10,  }}> {/* borderBottomWidth: 1, borderBottomColor: "#cbcbcb" */}
                                {/* Item Name */}
                                <AppText variant="small" style={{ fontSize: 15, color: "#666", flex: 1 }}>
                                    {order?.menuItemId?.name || "Burger"}
                                </AppText>
                                      
                                {/* Quantity */}
                                <AppText variant="small" style={{ fontSize: 15, color: "#666" }}>
                                    x {order?.quantity || 10}
                                </AppText>
                            </View>
                        </View>
                    ))} 
                </View>
            </View>

            <View style={{  marginHorizontal: 12, marginTop: 10, borderWidth: 1, borderColor: "#cbcbcb",  borderRadius: 12,  }}> 
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#cbcbcb", padding: 10, }}>
                    <MaterialCommunityIcons name="storefront-outline" size={24} color="#0f172a" />
                    <AppText variant="small" style={{ fontSize: 15, color: "#0f172a", color: "#0f172a"}}>Pickup Details</AppText>
                </View>
                <View style={{ paddingBottom: 10,  padding: 10 }}>
                    <AppText variant="small" style={{ fontSize: 14, color: "#0f172a", marginBottom: 5 }}>{order?.restaurantId?.name || "Hotel Amber"}</AppText>
                    <AppText variant="small" style={{ fontSize: 14, color: "#666", fontFamily: "Nunito", textTransform: "uppercase" }}>{order?.restaurantId?.address.street || "Chitnis Nager, 442301, Nagpur"}</AppText>                                
                </View>

                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: "#cbcbcb", alignSelf: "flex-start", margin: 10, borderRadius: 20 }} onPress={() => handlecall(order?.restaurantId?.phone)}>
                    <Ionicons name="call" size={17} color="#0f172a" />
                    <AppText variant="small" style={{ fontSize: 17, color: "#0f172a", }}>Call Restaurant</AppText>                                
                </TouchableOpacity>
                
            </View>
            <View style={{ position: "absolute", bottom: 5, left: 16, right: 16 }}>
                <DeliveryActionArea 
                    status={order?.status}
                    loading={isUpdating}
                    // onUpdateStatus={updateStatus}    
                    orderNo={order?.orderNo}
                    isVerifyPage={true}
                    onUpdateStatus={handlePickupSlide}
                />
            </View>
        </View>
        </RootWrapper>
    )
}