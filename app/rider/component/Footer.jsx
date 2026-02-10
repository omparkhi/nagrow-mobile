import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import AppText from "@/components/AppText";
import { Heart } from "lucide-react-native";
import { fontFamilies } from "@/constants/typography";

export default function RiderFooter({ style }) {
    return (
        <View style={{ alignItems: "center", marginBottom: style + 20, paddingVertical: 20, zIndex: 9999 }}>
            <AppText style={{ color: "#ffffff", fontSize: 50, lineHeight: 60,  }}>Live it up</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <AppText style={{ fontFamily: "Nunito", color: "#ffffff", fontSize: 15 }}>crafted with</AppText>
                <Heart color="red" fill="red" size={10} />
                <AppText style={{ fontFamily: "Nunito", color: "#ffffff", fontSize: 15 }}>in Nagpur</AppText>
            </View>
        </View>
    )
}