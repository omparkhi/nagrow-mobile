import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "../TouchableOpacity";
import AppText from "@/components/AppText";
import { Heart } from "lucide-react-native";
import { fontFamilies } from "@/constants/typography";

export default function Footer() {
    return (
        <View style={{ alignItems: "center" }}>
            <AppText style={{ color: "#a3a3a3", fontSize: 70, lineHeight: 70,  }}>Live it up</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <AppText style={{ fontFamily: "Nunito", color: "#c3c3c3", fontSize: 15 }}>crafted with</AppText>
                <Heart color="red" fill="red" size={10} />
                <AppText style={{ fontFamily: "Nunito", color: "#c3c3c3", fontSize: 15 }}>in Nagpur</AppText>
            </View>
        </View>
    )
}