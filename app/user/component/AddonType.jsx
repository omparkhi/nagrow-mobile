import React from "react";
import { View, StyleSheet,  } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function AddOnFoodType({item}) {
    const isVeg = item?.type === "veg";
    // console.log("type: ", item?.type)

    return (
        <View style={{flexDirection:'row'}}>
            <View style={{ borderWidth: 1, padding: 3, borderRadius: 4, alignSelf: 'flex-start', marginTop: 3, borderColor: isVeg ? "green" : "red" }}>
                <View style={{ backgroundColor: isVeg ? "green" : "red", width: 8, height: 8, borderRadius: 2 }} />
            </View>
        </View>
    )
}

