import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Vibration, Modal } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getCart, getGrandTotal, getTotalItems, clearCart } from "@/redux/slices/cart/cartSlice";
import { ChevronRight, Trash } from "lucide-react-native";
import AppText from "@/components/AppText";
import { useRouter, useSegments } from "expo-router";
import * as Haptics from 'expo-haptics';
import { TouchableOpacity } from "@/app/TouchableOpacity";

const CartSummaryBar = () => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const cart = useSelector(getCart);
  const grandTotal = useSelector(getGrandTotal);
  const totalItem = useSelector(getTotalItems);

  const items = cart?.items || [];
  const restaurantId = cart?.restaurantId;
  const restaurantName = cart?.restaurantName;
  const currentPath = "/" + segments.join("/");
  

  const handlePress = () => {
    // Tiny vibration to mimic tap feedback
    Vibration.vibrate(10); // duration in ms
  };
  // console.log("CURRENT PATH:", currentPath);

  // Current screen check
  const isCartPage = currentPath === "/user/cart/cart-page";
  const isMenuPage = currentPath === "/user/restaurant/[id]"

  const images = items
  .map(i => i.image)
  .filter(Boolean)
  .slice(0, 3);

  if (isCartPage) return null;
  
  if (!items || items.length === 0) return null;

  const handleTrashClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const confirmClearCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    dispatch(clearCart());
    setModalVisible(false);
  };

  if (isMenuPage) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.MenuContainer}>
          <AppText variant="small" style={{ fontSize: 16, color: "#ffffffff" }}>{totalItem} item{totalItem > 1 ? "s" : ""} added</AppText>
          <TouchableOpacity
          onPress={() =>
            // navigation.navigate("Cart", { restaurantId })
            router.push("/user/cart/cart-page")
          }
          navigate={true} // 👈 Locks navigation AND vibrates
          haptic="Medium"
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}
        >
          <AppText variant="small" style={{fontSize: 19, color: "#fff"}}>View Cart</AppText>
          <ChevronRight size={22} color="#fff" />
        </TouchableOpacity>
        </View>
      </View>
    )
  }


  return (
    <>
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.imageStack}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={[
                  styles.image,
                  { left: index * 8, zIndex: 5 - index }
                ]}
              />
            ))}

            {items.length > 2 && (
              <View style={[styles.moreBadge, { left: images.length * 14 }]}>
                <AppText style={styles.moreText}>
                  +{items.length - 2}
                </AppText>
              </View>
            )}
          </View>
          <View style={{ width: "auto", marginLeft: 5 }}>
            <AppText variant="small" style={styles.restName} numberOfLines={1} ellipsizeMode="tail">{restaurantName}</AppText>
          </View>
        <TouchableOpacity
          onPress={() =>
            // navigation.navigate("Cart", { restaurantId })
            router.push("/user/cart/cart-page")
          }
          style={styles.button}
        >
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
            <AppText variant="small" style={styles.items}>
              {totalItem} item{totalItem > 1 ? "s" : ""}
            </AppText>
            <AppText variant="small" style={styles.total}>|</AppText>
            <AppText variant="small" style={styles.total}>₹{grandTotal}</AppText>
          </View>
          <AppText variant="small" style={styles.buttonText}>Checkout</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTrashClick} style={styles.clearBtn} >
          <Trash color="red" size={20} />
        </TouchableOpacity>
      </View>
    </View>

    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Clear Cart?</AppText>
            <AppText variant="small" style={styles.modalText}>
              Are you sure you want to remove all items from <AppText style={{color: '#555', fontSize: 15, fontFamily: "Nunito", textTransform: "capitalize"}}>{restaurantName}</AppText>?
            </AppText>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <AppText variant="small" style={{color: '#fd731dff'}}>No</AppText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                haptic="heavy"
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={confirmClearCart}
              >
                <AppText variant="small" style={{color: 'white'}}>Yes</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </>
  );
};

export default CartSummaryBar;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99999,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#ffffffff",
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
    // gap: 5,
  },
  items: {
    color: "#fff",
    fontSize: 12,
  },
  total: {
    color: "#fff",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#00ac22ff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginTop: -4,
  },
  clearBtn: {
    marginLeft: 5,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#ffe5e5ff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 10,
    height: 10,
    backgroundColor: "green",
    borderRadius: 3,
  },

  imageStack: {
  width: 60,
  height: 45,
  position: "relative",
},

image: {
  width: 45,
  height: 45,
  borderRadius: 25,
  position: "absolute",
},

moreBadge: {
  position: "absolute",
  width: 28,
  height: 28,
  borderRadius: 6,
  backgroundColor: "#333",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1.5,
  borderColor: "#fff",
},

moreText: {
  fontSize: 10,
  color: "#fff",
},
restName: {
  fontSize: 17,
  color: "#000", 
  width: "90%",
  textTransform: "capitalize",
},
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    // alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    // marginBottom: 10,
  },
  modalText: {
    // textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    color: '#555',
    fontSize: 15, 
    fontFamily: "Nunito",
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#bd835f32',
  },
  confirmBtn: {
    backgroundColor: '#fd731dff',
  },

  MenuContainer: {
    width: "95%",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#00b069ff",
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 20,
    // marginHorizontal: 5,
    borderRadius: 12,

    alignItems: "center",
  }

});
