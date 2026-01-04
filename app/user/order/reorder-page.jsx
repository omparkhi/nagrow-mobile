import React from "react";
import { View, Modal, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReorderModal from "./reorder-modal";
import UserPastOrder from "./order-history";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function ReOrderPage() {
    const router = useRouter();
    return (
        <View>
            <View style={{ backgroundColor: "#ffffffff", flexDirection: "row", alignItems: "center", paddingVertical: 15 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 16, }}>
                    <Ionicons name="arrow-back" size={25} color="#444444ff" />
                </TouchableOpacity>
                <AppText variant="small" style={{ color: "#444444ff" }}>Reorder</AppText>
            </View>
            <ScrollView style={{ marginHorizontal: 15, marginBottom: 40, marginTop: 10, zIndex: 99 }}>
                <UserPastOrder/>
            </ScrollView>
        </View>
    )
}