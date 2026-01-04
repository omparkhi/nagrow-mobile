import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { fetchOrderHistory, updateOrderReview } from "@/redux/slices/user/userOrderSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import restaurantImage from "@/assets/restaurant.jpg";
import { fontFamilies } from "@/constants/typography";
import AppText from "@/components/AppText";
import { Check, IndianRupee, Star, Minus, ChevronRight, X } from 'lucide-react-native';
import axios from "axios";
import ReorderModal from "./reorder-modal";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import RatingModal from "../RatingModal";

const calculateFoodRating = (menuItems = []) => {
  if (!menuItems.length) return 0;
  const sum = menuItems.reduce((acc, i) => acc + (i.rating || 0), 0);
  return Math.round(sum / menuItems.length);
};

export default function UserPastOrder() {
    const dispatch = useDispatch();
    const { orderHistory, loading } = useSelector(state => state.userOrder);

    const [visibleCount, setVisibleCount] = useState(2);
    const [expanded, setExpanded] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [reorderData, setReorderData] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(false);

    
    const [loadingOrderId, setLoadingOrderId] = useState(null);

    const [localRatings, setLocalRatings] = useState({});

    // Rating Modal State
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);

    const openRatingModal = (order) => {
        setSelectedOrderForRating(order);
        setRatingModalVisible(true);
    };

    //  HANDLE SUCCESS (Turn stars yellow instantly)
    const handleRatingSuccess = (orderId, ratings) => {
        dispatch(updateOrderReview({
            orderId: orderId,
            reviewData: {
                menuItems: ratings.menuItems,
                deliveryRating: ratings.deliveryRating,
                // Add comment if needed
            }
        }));
        // setLocalRatings(prev => ({
        //     ...prev,
        //     [orderId]: ratings
        // }));
        // Optionally dispatch an action to update Redux if you want persistency across screens
    };


    useEffect(() => {
        dispatch(fetchOrderHistory());
    }, []);

    // useEffect(() =>{
    //     console.log("order history: ", orderHistory);
    // }, []);

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
    
        // Format: "Dec 11, 6:30 PM"
        return date.toLocaleString('en-US', {
            month: 'short',    // "Dec"
            day: 'numeric',    // "11"
            hour: 'numeric',   // "6"
            minute: '2-digit', // "30"
            hour12: true       // "PM"
        });
    };

    const handleReorderClick = async (orderId) => {
        try {
            setLoadingOrderId(orderId)
            const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/payment/reorder`, { orderId });
            if (data.success) {
                setReorderData(data); // Store data for modal
                setModalVisible(true); // Show Modal
            }
        } catch (err) {
            // Handle Restaurant Closed specifically
            if (err.response?.data?.errorType === "RESTAURANT_CLOSED") {
                 Alert.alert("Restaurant Closed", err.response.data.message);
            } else {
                 Alert.alert("Error", "Could not fetch reorder details.");
            }
        } finally {
            setLoadingOrderId(null);
        }
    };

    // Helper to render static or active stars
    const RenderStars = ({ count, type, onPress }) => {
        // 'count' is the rating (0 if not rated)
        const isRated = count > 0;
        
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <AppText variant="small" style={{ fontSize: 13, color: '#828080ff', marginBottom: 5, margin: "auto" }}>
                    {type === 'food' ? "Food Rating" : "Delivery Rating"}
                </AppText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                            key={star} 
                            size={17} 
                            // 🟡 YELLOW if rated, GREY if not
                            color={star <= count ? "#f5a623" : "#cfcfcf"} 
                            fill={star <= count ? "#f5a623" : "#e5e5e5"} 
                            strokeWidth={1} 
                        />
                    ))}
                </View>
                {!isRated && (
                    <AppText style={{fontSize:10, color:'#fd731d', marginTop:2}}>Rate Now</AppText>
                )}
            </TouchableOpacity>
        );
    };

    const renderOrderHistory = ({ item: history }) => {
        const review = history.myReview; 
        const localReview = localRatings[history._id];

        // Merge them (Local takes priority for instant UI update)
        const currentRating = localReview || review || { foodRating: 0, deliveryRating: 0 };
        const isThisOrderLoading = loadingOrderId === history._id;

        const foodRating = review?.menuItems
            ? calculateFoodRating(review.menuItems)
            : 0;

        const deliveryRating = review?.deliveryRating || 0;

        return (
        <View style={styles.card}>
            <LinearGradient 
                colors={['#eeeeeeff', 'rgba(255,255,255,0)']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 0.95, y: 0 }}
                style={styles.header}
            > 
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10}}>
                    <Image source={ restaurantImage }  style={{ height: 45, width: 45, borderRadius: 8, backgroundColor: "#e2e8f0", }} />
                    <View>
                        <AppText variant="small" style={styles.restName}>{history.restaurantId.name}</AppText>
                        <AppText variant="small" style={{ color: "#a2a2a2ff", fontSize: 12, fontFamily: "Nunito", marginTop: -3 }}>Nandori chowk</AppText>
                    </View>
                </View>
                
                {history.status === "delivered" ? (    
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: -20, gap: 3 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 2, backgroundColor: "green", borderRadius: 10 }} >
                        <Check color="white" size={8} strokeWidth={4} />
                    </View>
                    <AppText style={{ fontSize: 11, color: "green" }}>Delivered</AppText>
                </View>
                ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: -20, gap: 3 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 2, backgroundColor: "red", borderRadius: 10 }} >
                            <X color="white" size={8} strokeWidth={4} />
                        </View>
                        <AppText style={{ fontSize: 11, color: "red" }}>Cancelled</AppText>
                    </View>
                )}
                
            </LinearGradient>

            {/* 2. THE ITEMS LIST (The part you asked about) */}
      <View style={styles.itemsContainer}>
        {history.items.map((item, index) => (
        <View>
           <View key={index} style={styles.itemRow}>
              {/* Bullet point or small quantity badge */}
              <View style={{ flexDirection: "row", alignItems:"center", gap: 4 }} >
                <Image source={{ uri: item.menuItemId?.image }} style={{ width: 25, height: 25, borderRadius: 4, backgroundColor: '#eee' }} />
                <View style={styles.qtyBadge}>
                    <AppText style={styles.qtyText}>{item.quantity}x</AppText>
                </View>

                {/* Item Name */}
                <AppText style={styles.itemName}>
                    {item.menuItemId?.name || "Unknown Item"}
                </AppText>
              </View>
              
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }} >
                <IndianRupee color= '#444444ff' size={12} />
                <AppText variant="small" style={{ fontSize: 14, fontFamily: "Nunito", color: '#444444ff' }}>{item.menuItemId?.price}</AppText>
              </View>

           </View>
        </View>
        
        ))}
        <AppText style={{ fontSize: 13, color: '#828080ff', fontFamily: "Nunito" }}>& more</AppText>
      </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 15, marginTop: -5 }}>
            {/* <View>
                <AppText variant="small" style={{ fontSize: 13, color: '#828080ff', margin: "auto", marginBottom: 5 }}>Food Rating</AppText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                </View>
            </View>
            <AppText variant="light" style={{ fontSize: 40, color: '#e3e3e3ff', margin: "auto", marginBottom: 5 }}>|</AppText>
            <View>
                <AppText variant="small" style={{ fontSize: 13, color: '#828080ff', margin: "auto", marginBottom: 5 }}>Delivery Rating</AppText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                    <Star size={17} color="#cfcfcfff" fill="#e5e5e5ff" strokeWidth={1} />
                </View>
            </View> */}
            {/* Food Rating */}
            <RenderStars 
                count={foodRating} 
                type="food" 
                onPress={() => openRatingModal(history)} 
            />
            <AppText variant="light" style={{ fontSize: 40, color: '#e3e3e3ff', marginBottom: 5 }}>|</AppText>        
            {/* Delivery Rating */}
            <RenderStars 
                count={deliveryRating} 
                type="delivery" 
                onPress={() => openRatingModal(history)} 
            />
        </View>

        <TouchableOpacity 
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center",padding: 9, marginTop: 8, marginHorizontal: 5, backgroundColor: "#bd835f32", borderRadius: 10 }}
            onPress={() => handleReorderClick(history._id)}
            disabled={isThisOrderLoading}
        >
            {isThisOrderLoading ? (
                <ActivityIndicator color="#fd731d" size="small" />
                ) : (
                    <>
                        <AppText variant="small" style={{ color: "#fd731dff" }}>Reorder</AppText>
                        <ChevronRight size={16} color="#fd731dff" />
                    </>
                )}
        </TouchableOpacity>

        <View  style={{ marginTop: 5, paddingHorizontal: 5, flexDirection: "row", marginBottom: 8 }}>
            <AppText variant="small" style={{ fontSize: 11, color: '#999', textAlign: 'left',  }}>
            {/* Call the function here passing the order creation date */}
                 Ordered: {formatDate(history.createdAt)}
            </AppText>
            <AppText variant="small" style={{ fontSize: 11, color: '#999'}}> - BILL TOTAL:</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 5 }} >
                <IndianRupee color= '#444444ff' size={10} />
                <AppText variant="small" style={{ fontSize: 11, color: '#3e3e3eff'}}>{history.totalAmount}</AppText>
            </View>
        </View>
        </View>
    )
    }

    const handleToggleShowMore = () => {
        if (expanded) {
            setVisibleCount(2); // Collapse back to 3
            setExpanded(false);
        } else {
            // 1. Turn on the loader switch FIRST
            setIsExpanding(true); 

            // 2. Wait for 1 second (while loader spins)
            setTimeout(() => {
                // 3. NOW expand the list and hide the loader
                setVisibleCount(orderHistory.length); 
                setExpanded(true);
                setIsExpanding(false); 
            }, 100);
        }
    };

    const renderFooter = () => {
        // Only show button if we have more than 3 orders
        if (orderHistory.length <= 3) return null;

        if (isExpanding) {
            return (
                <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator size="small" color="#fd731dff" />
                </View>
            );
        }

        return (
                <TouchableOpacity onPress={handleToggleShowMore} style={styles.showMoreBtn}>
                <AppText style={{ color: "#666", fontSize: 13 }}>
                    {expanded ? "Show Less" : `View ${orderHistory.length - 2} more orders`}
                </AppText>
                <Ionicons 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#666" 
                    style={{ marginLeft: 4 }}
                />
            </TouchableOpacity>
        )
    };

    return (
        <>
            <FlatList
                data={orderHistory.slice(0, visibleCount)}
                keyExtractor={(history) => history._id}
                renderItem={renderOrderHistory}
                contentContainerStyle={{paddingBottom: 100 }}
                ListFooterComponent={renderFooter}
            />

            {selectedOrderForRating && (
                <RatingModal 
                    visible={ratingModalVisible}
                    onClose={() => setRatingModalVisible(false)}
                    orderData={selectedOrderForRating}
                    onSuccess={handleRatingSuccess}
                />
            )}
            <ReorderModal 
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                data={reorderData}
            />
        </>
    )

}

const styles = StyleSheet.create({
    card: {
        padding: 3,
        backgroundColor: "#ffffffff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e6e6e6ff",
        marginBottom: 20
    },
    header: {
        width: "100%",
        padding: 8,
        // paddingVertical: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopRightRadius: 6,
        borderTopLeftRadius:6,
    },
    restName: {
        textTransform: "capitalize"
    },
    itemsContainer: { marginVertical: 8, marginHorizontal: 15, borderBottomWidth: 1, borderBottomColor: "#e6e6e6ff", },
    itemRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: "space-between",
        paddingBottom: 4,
        // marginBottom: 6 
    },
    qtyBadge: {
        backgroundColor: '#f5f5f5ff',
        paddingHorizontal: 5,
        // paddingVertical: 2,
        borderRadius: 4,
        marginRight: 5
    },
    qtyText: { fontSize: 12, fontFamily: "Nunito", color: '#444444ff', lineHeight: 20 },
    itemName: { fontSize: 14, fontFamily: "Nunito", color: '#444444ff', lineHeight: 15, marginLeft: -5 },
    showMoreBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center"
    }
})