import React from "react";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function HandleBack () {
    const router = useRouter();

    const handleBack = () => router.back();

    return (
        <>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="arrow-back" size={25} color="#fff" />
            </TouchableOpacity>
        </>
    )
}

const styles = StyleSheet.create({
    backBtn: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 9999,
        // padding: 10, 
  },
})