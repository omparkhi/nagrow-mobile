import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Modal, ActivityIndicator, Image, StatusBar as NativeStatusBar, Platform } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import axios from "axios";
import RootWrapper from "@/app/rootWrapper";
import Nunito from "@/assets/fonts/Nunito-Bold.ttf";
import { Star } from "lucide-react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function SearchModal({ visible, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ restaurants: [], menus: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2) {
                performSearch(query);
            } else {
                setResults({ restaurants: [], menus: [] });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    useEffect(() => {
        if (visible && Platform.OS === 'android') {
            // Force the status bar to be transparent so the white background shows through
            NativeStatusBar.setTranslucent(true);
            NativeStatusBar.setBackgroundColor('transparent');
            
            // Force the text/icons to be Dark (Black)
            NativeStatusBar.setBarStyle('dark-content');
        }
    }, [visible]);

    const performSearch = async (text) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/user/search?q=${text}`);
            setResults(data);
        } catch (err) {
            console.log("Search error", err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }) => {
        const isDish = item.price !== undefined;
        const imageUrl = isDish 
            ? item.image 
            : item?.documents?.shopPhotoUrl;

        return (
            <TouchableOpacity style={styles.resultItem} onPress={() => router.push(`/user/restaurant/${item?.restaurantId?._id}`)}>
                <Image 
                    source={{ uri: imageUrl || "https://via.placeholder.com/50" }} 
                    style={styles.thumb} 
                />
                <View style={{ flex: 1 }}>
                    <AppText variant="variant" style={styles.resultTitle}>
                        {isDish ? item?.name : item?.name}
                    </AppText>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        <View style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f3f3ff", borderRadius: 20 }}>
                            <Star size={16} color="#00a613ff" />
                        </View>
                        <AppText variant="small" style={{ color: "#333" }}>{item?.restaurantId?.rating || 3.1} ({item?.restaurantId?.totalRatings || "5"})</AppText>
                        <AppText variant="small" style={{ color: "#333" }}>• {item?.deliveryTimeEstimate || "30 min"}</AppText>
                    </View>
                    <AppText style={styles.resultSub}>
                        {isDish 
                            ? `Dish in ${item?.restaurantId?.name || "Unknown Kitchen"}` 
                            : `Restaurant • ${item?.address?.street || "Nagpur"}`
                        }
                    </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        );
    };

    return (
        
        <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent={true}>
            <RootWrapper topSafeAreaColor="black" bottomSafeAreaColor="white" barStyle="white">
            
            <View style={styles.container}>
                {/* Header Area */}
                <View style={{ borderBottomWidth: 1, borderBottomColor: "#d1d1d1ff", borderRadius: 15 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={{ width: "80%" }} >
                        <AppText variant="small" style={{ fontSize: 14, color: "#525252ff", fontFamily: "Nunito", textAlign: "center" }}>Search for Restaurants and Dishes</AppText>
                    </View>
                </View>
                
                <View style={styles.searchBox}>
                    <Feather name="search" size={20} color="#ff5733" />
                    <TextInput
                        style={styles.input}
                        placeholder="Type Biryani, Pizza..."
                        placeholderTextColor="#888"
                        value={query}
                        onChangeText={setQuery}
                        autoFocus={true} // Opens keyboard immediately
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")}>
                            <Ionicons name="close-circle" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
                </View>
                {/* Content Area */}
                {loading ? (
                    <ActivityIndicator size="large" color="#ff5733" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList 
                        data={[...results.restaurants, ...results.menus]}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 15 }}
                        ListEmptyComponent={
                            query.length > 2 && !loading ? (
                                <AppText style={{ textAlign: "center", marginTop: 50, color: "#888" }}>
                                No food found 😔
                                </AppText>
                            ) : null
                        }
                    />
                )}
            </View>
            </RootWrapper>
            </Modal>
            
        
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10,  }, // Safe area handling needed usually borderBottomWidth: 1, borderBottomColor: "#eee",
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: { marginRight: 10 },
  searchBox: {
    marginHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#d1d1d1ff",
    // paddingVertical: 5,
    height: 50,
    marginBottom: 10
  },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: "#333", fontFamily: "Nunito" },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  thumb: { width: 90, height: 90, borderRadius: 6, marginRight: 12, backgroundColor: '#eee' },
  resultTitle: { fontSize: 20, textTransform: "capitalize" },
  resultSub: { fontSize: 12, color: "#888", marginTop: -4 },
});