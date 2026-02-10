import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FlatList, Image, InteractionManager, ScrollView, View } from "react-native";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { fetchTopPicks } from "@/redux/slices/user/restaurantSlice";
import { LinearGradient } from "expo-linear-gradient";
import FoodType from "../component/FoodType";
import { useRouter } from "expo-router";
import { IndianRupee } from "lucide-react-native";

export default function TopPicks() {
    const router = useRouter();
    const dispatch = useDispatch();
    const topPicks = useSelector((state) => state.restaurants.topPicks);

    useEffect(() => {
        dispatch(fetchTopPicks(150));
    }, []);

    useEffect(() => {
        console.log("Top Picks: ", topPicks)
    }, [topPicks])

    const handleNavigate = (id) => {
        InteractionManager.runAfterInteractions(() => {
            router.push(`/user/restaurant/${id}`)
        })
    }

    return (
        <View  style={{  paddingVertical: 10 }}>
                <View style={{ alignItems: "center", padding: 10, backgroundColor: "#eee", marginHorizontal: 16, marginBottom: 10, borderRadius: 50 }}>
                    <AppText variant="small" style={{ fontSize: 15, color: "#f36c0b",  }}>Top Picks Under RS. 150</AppText>
                </View>
                <FlatList 
                    data={topPicks}
                    horizontal
                    keyExtractor={(item) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingVertical: 10, borderRadius: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleNavigate(item.restaurantId)}>
                            <View style={{ width: 110, marginLeft: 16,  }}>
                                <Image source={{ uri: item.image }} style={{ height: 120, width: "100%", borderRadius: 10 }} resizeMode="cover" />
                                <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
                                    <FoodType item={item} />
                                    <AppText variant="small" style={{ fontSize: 14, color: "#2b2b2b", lineHeight: 15, textTransform: "capitalize" }} numberOfLines={1}>{item.name}</AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", flex : 1, marginTop: 5, backgroundColor: "#ffaa00", padding: 5, alignSelf: "flex-start", borderRadius: 5, marginLeft: 15 }}>
                                    <IndianRupee color="#000000" strokeWidth={3} size={10} />
                                    <AppText variant="small" style={{ fontSize: 12, color: "#000000", lineHeight: 15, textTransform: "capitalize" }}>{item.price}</AppText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            {/* </LinearGradient> */}
        </View>
    )
}