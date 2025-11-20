import React from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function HandleBack () {
    const router = useRouter();

    const handleBack = () => router.back();

    return (
        <>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Feather name="arrow-left" size={18} color="#fff" />
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