import { useDispatch, useSelector } from "react-redux";
import { addToCartThunk, increment, decrement, clearCart } from "@/redux/slices/cart/cartSlice";
import { View, Text, Image, TouchableOpacity } from "react-native";
import AppText from "@/components/AppText";
import { useEffect } from "react";
import { Alert } from "react-native";

export default function RestaurantMenu({ menu, restaurant }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);

  const qty = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

 const handleAddItem = async (menuItem) => {
  const resultAction = await dispatch(
    addToCartThunk({
      menuItem, 
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
      },
    })
  );

  const result = resultAction.payload;

  if (result?.conflict) {
    Alert.alert(
      "Different Restaurant",
      `Your cart has items from ${result.currentRestaurant}. Clear cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            await dispatch(clearCart());

            await dispatch(
              addToCartThunk({
      menuItem, 
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
      },
    })
            );
          },
        },
      ]
    );
  }
};


  


  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
      {Object.keys(menu).map((cat) => (
        <View key={cat}>
          <AppText style={{ fontSize: 20, marginBottom: 10 }}>
            {cat}
          </AppText>

          {menu[cat].map((item) => (
            <View
              key={item._id}
              style={{
                flexDirection: "row",
                paddingVertical: 15,
                borderTopWidth: 1,
                borderColor: "#ddd",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: 90, height: 90, borderRadius: 10 }}
              />

              {/* Add / Controls */}
              <View style={{ position: "absolute", left: 15, bottom: 5}}>
                {qty(item._id) === 0 ? (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddItem(item)}
                  >
                    <AppText variant="small" style={styles.addTxt}>ADD</AppText>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyBox}>
                    <TouchableOpacity onPress={() => dispatch(decrement(item._id))}>
                      <AppText variant="small" style={styles.qtyBtn}>−</AppText>
                    </TouchableOpacity>

                    <AppText variant="small" style={styles.qtyVal}>{qty(item._id)}</AppText>

                    <TouchableOpacity onPress={() => dispatch(increment(item._id))}>
                      <AppText variant="small" style={styles.qtyBtn}>+</AppText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={{ flex: 1, marginLeft: 15 }}>
                <AppText style={{ fontSize: 18 }}>{item.name}</AppText>
                <AppText variant="small">₹{item.price}</AppText>
                <AppText variant="light">{item.description}</AppText>
              </View>

            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = {
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    
  },
  addTxt: {
    color: "#007aff",
  },
  qtyBox: {
    flexDirection: "row",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qtyBtn: {
    // fontSize: 20,
    color: "#007aff",
    paddingHorizontal: 2,
  },
  qtyVal: {
    marginHorizontal: 2,  
  },
};
