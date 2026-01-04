import React, { useState, useRef, useEffect } from "react";
import { View, Modal, TextInput, StyleSheet, ActivityIndicator, Alert, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { Star } from "lucide-react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "../TouchableOpacity";

const { height } = Dimensions.get("window");

export default function RatingModal({ visible, onClose, orderData, onSuccess }) {
    const [itemRatings, setItemRatings] = useState({});
    const [foodRating, setFoodRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleItemRating  =(itemId, rating) => {
      setItemRatings(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], rating }
      }));
    };

    const handleItemComment = (itemId, comment) => {
      setItemRatings(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], comment }
      }));
    };

      const handleSubmit = async () => {
        const menuItems = Object.entries(itemRatings)
          .filter(([_, v]) => v.rating)
          .map(([id, v]) => ({
            menuItemId: id,
            rating: v.rating,
            comment: v.comment || ""
          }));


        if (menuItems.length === 0 && deliveryRating === 0) {
          Alert.alert("Rating required", "Please rate at least one item or delivery");
          return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const safeRiderId = orderData.riderId?._id || orderData.riderId || null;
            const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/user/submit-review`,
                {
                    orderId: orderData._id,
                    restaurantId: orderData.restaurantId._id,
                    riderId: safeRiderId, // Ensure your order object has this
                    menuItems,
                    deliveryRating,
                    deliveryComment: comment
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res)

            onSuccess(orderData._id, { menuItems, deliveryRating });
            handleClose();
        } catch (error) {
           console.log("Rating Error", error);
            Alert.alert("Error", "Could not submit rating");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFoodRating(0);
        setDeliveryRating(0);
        setComment("");
        onClose();
    };

    const [showModal, setShowModal] = useState(visible);
  
  // Start position: -300 (Above the screen)
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      // Animate Down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8, // Adds a little "bounce" effect
        speed: 12
      }).start();
    } else {
      // Animate Up
      Animated.timing(slideAnim, {
        toValue: -300, // Move back up
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowModal(false)); // Hide modal after animation
    }
  }, [visible]);

  if (!showModal) return null;

    const StarRow = ({ label, value, onChange }) => (
    <View style={{ marginBottom: 20, alignItems: 'center' }}>
      <AppText variant="small" style={{ marginBottom: 8 }}>{label}</AppText>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Star 
              size={20} 
              color={star <= value ? "#f5a623" : "#e2e8f0"} 
              fill={star <= value ? "#f5a623" : "transparent"} 
              strokeWidth={2}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

    return (
    <Modal visible={showModal} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <AppText variant="small" style={{fontSize: 16, color: '#666'}}>Rate Order from <AppText style={{fontSize: 16, color: '#666', textTransform: "capitalize"}}>{orderData?.restaurantId?.name}</AppText></AppText>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Rating Inputs */}
          <View style={{ marginVertical: 20 }}>
            <StarRow label="How was the Food?" value={foodRating} onChange={setFoodRating} />
            
            {/* Only show Rider rating if a rider was assigned */}
            {orderData?.riderId && (
               <StarRow label="How was the Delivery?" value={deliveryRating} onChange={setDeliveryRating} />
            )}
          </View>

          {/* Comment Box */}
          <TextInput 
            style={styles.input}
            placeholder="Write a comment (Optional)"
            placeholderTextColor="#888"
            value={comment}
            onChangeText={setComment}
            multiline
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <AppText variant="small" style={styles.btnText}>Submit Review</AppText>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {  flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', marginBottom: 40, marginTop: 40 },
  container: { backgroundColor: 'white', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subText: { color: '#666', marginTop: 5, textAlign:'center' },
  input: { fontFamily: "Nunito", backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, height: 80, textAlignVertical: 'top', borderWidth:1, borderColor:'#eee' },
  submitBtn: { backgroundColor: '#fd731d', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: 'white', fontSize: 18 }
});