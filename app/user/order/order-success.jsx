import React, { useEffect } from "react";
import { View, Text } from "react-native";
// import { View } from "lucide-react-native";
import { BackHandler } from "react-native";

export default function OrderSuccess () {
//     useEffect(() => {
//   const prevent = BackHandler.addEventListener("hardwareBackPress", () => true);
//   return () => prevent.remove();
// }, []);
    return (
        <View>
            <Text>Order Success</Text>
            <View />
        </View>
    )
}