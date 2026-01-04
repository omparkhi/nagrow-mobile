import React, { useState, useEffect } from "react";
import { View, Modal, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useDispatch } from "react-redux";
import { replaceCart } from "@/redux/slices/cart/cartSlice";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Minus, Plus } from 'lucide-react-native';
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function ReorderModal({ visible, onClose, data }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const [items, setItems] = useState([]);

    useEffect(() => {
        if (data?.items) {
            setItems(data?.items);
        }
    }, [data]);

    const handleIncreament = (id) => {
        setItems(prev => prev.map(item => 
            item.id === id ? {...item, quantity: item.quantity + 1} : item
        ));
    };

    const handleDecrement = (id) => {

        setItems(prev => prev.map(item => 
            item.id === id ? {...item, quantity: Math.max(0, item.quantity - 1)} : item
        ).filter(i => i.quantity > 0)); // Remove if 0
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            // Only sum up AVAILABLE items
            if(item.isavailable) return sum + (item.price * item.quantity);
            return sum;
        }, 0);
    };

    const handleProceed = () => {
        const finalItems = items.filter(i => i.isavailable);

        if (finalItems.length === 0) {
            Alert.alert("Error", "No available items to order.");
            return;
        }

        dispatch(replaceCart({
            restaurantId: data?.restaurant?._id || data?.restaurantId,
            restaurantName: data.restaurant.name,
            items: finalItems
        }));

        onClose(); // Close modal
        router.push("/user/cart/cart-page"); // Go to checkout
    };

return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <LinearGradient 
                            colors={['#e8f4ffff', 'rgba(255,255,255,0)']} 
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.99, y: 0 }}
                            style={{ paddingHorizontal: 6, paddingVertical: 11, borderRadius: 10 }}
                         >
                            <AppText variant="small" style={{color:"#fd731d"}}>Reorder from {data?.restaurant?.name}</AppText>
                            {/* <AppText variant="small" >
                                
                            </AppText> */}
                        </LinearGradient>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#ccc" />
                        </TouchableOpacity>
                    </View>

                    {/* Warning for Unavailable Items */}
                    {data?.unavailableCount > 0 && (
                        <View style={styles.warningBox}>
                            <AppText style={styles.warningText}>
                                ⚠️ Some items are currently unavailable.
                            </AppText>
                        </View>
                    )}

                    {/* Items List */}
                    <ScrollView style={{ maxHeight: 300 }}>
                        {items.map((item) => (
                            <View key={item.id} style={[styles.itemRow, !item.isavailable && styles.disabledRow]}>
                                <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                                    <Image source={{ uri: item.image }} style={styles.itemImg} />
                                    <View style={{marginLeft: 10}}>
                                        <AppText style={{ fontSize: 14, color: item.isavailable ? '#000' : '#aaa' }}>
                                            {item.name}
                                        </AppText>
                                        <AppText variant="small" style={{fontSize: 14, color: '#5c5c5cff', marginTop: -5}}>₹{item.price * item.quantity}</AppText>
                                        {!item.isavailable && <AppText style={{color:'red', fontSize:10}}>Out of Stock</AppText>}
                                    </View>
                                </View>

                                {/* Counter */}
                                {item.isavailable && (
                                    <View style={styles.counter}>
                                        <TouchableOpacity onPress={() => handleDecrement(item.id)}>
                                            <Minus size={18} color="#00ac22ff" strokeWidth={3} />
                                        </TouchableOpacity>
                                        <AppText variant="small" style={{fontSize: 17, marginHorizontal:8, color:"#00ac22ff"}}>{item.quantity}</AppText>
                                        <TouchableOpacity onPress={() => handleIncreament(item.id)}>
                                            <Plus size={18} color="#00ac22ff" strokeWidth={3} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    {/* Footer Button */}
                    <TouchableOpacity onPress={handleProceed} style={styles.proceedBtn}>
                        <AppText variant="small" style={{color:'white'}}>
                            Proceed with {items.filter(i=>i.isavailable).length} items • ₹{calculateTotal()}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    disabledRow: { opacity: 0.6 },
    itemImg: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eee' },
    warningBox: { backgroundColor: '#fff3cd', padding: 8, borderRadius: 5, marginBottom: 10 },
    warningText: { color: '#856404', fontSize: 12 },
    counter: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 4 },
    proceedBtn: { backgroundColor: '#fd731d', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }
});