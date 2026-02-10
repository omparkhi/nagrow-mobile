import React from "react";
import { View, StyleSheet,  } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function FoodType({item}) {
    const isVeg = item?.FoodType === "veg";
    return (
        <View style={{flexDirection:'row'}}>
            <View style={{ borderWidth: 1, padding: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 3, borderColor: isVeg ? "green" : "red" }}>
                <View style={{ backgroundColor: isVeg ? "green" : "red", width: 6, height: 6, borderRadius: 2 }} />
            </View>
        </View>
    )
}

