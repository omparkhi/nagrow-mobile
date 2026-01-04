import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { CookingPotIcon, PenIcon, PenLine, PenBoxIcon, Minus, Plus } from "lucide-react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import AnimatedCounter from "../component/AnimatedCounter";
import FoodType from "../component/FoodType";
import { fontFamilies } from "@/constants/typography";

export default function MenuSection({ items, increment, decrement, handleAddItem, restaurantId }) {
  console.log("item: ", items)
    const router = useRouter();
  const renderItem = ({ item }) => (  
    <View style={styles.row}>
      {item.image && (
        <View style={styles.rowLeft}>
          <FoodType item={item} />
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>
      )}
<View style={styles.flex1}>
  <AppText variant="small" style={styles.name}>
    {item.name} x {item.quantity}
  </AppText>

  {item.selectedAddons?.length > 0 && (
    <View style={{ marginTop: -1 }}>
      {item.selectedAddons.map(addon => (
        <AppText
          key={addon._id}
          style={{ fontSize: 10, color: "#666", lineHeight: 14 }}
        >
          • {addon.name}
        </AppText>
      ))}
    </View>
  )}
</View>

      <View style={styles.qtyContainer}>
        {/* <View style={styles.counterBox}>
          <TouchableOpacity onPress={() => decrement(item.id)}>
            <AppText style={styles.btn}>−</AppText>
          </TouchableOpacity>

          {/* <AppText style={styles.qtyText}>{item.quantity}</AppText> */}
          

          {/* <TouchableOpacity onPress={() => increment(item.id)}>
            <AppText style={styles.btn}>+</AppText>
          </TouchableOpacity>
        </View> */} 

        <View style={styles.counterBox}>
          <TouchableOpacity onPress={() => decrement(item.id)} hitSlop={10} style={{padding:1}}>
            <Minus size={14} color="#00b069ff" strokeWidth={3}/>
          </TouchableOpacity>
          {/* <AnimatedCounter count={item.quantity} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
          {/* <AppText variant="small" style={styles.qtyValSmall}>{qty}</AppText> */}
          <AnimatedCounter count={item.quantity} textStyle={styles.qtyValSmall} style={{ height: 20 }} />
          <TouchableOpacity onPress={() => increment(item.id)} hitSlop={10} style={{padding:1}}>
            <Plus size={14} color="#00b069ff" strokeWidth={3}/>
          </TouchableOpacity>
      </View>

        <AppText style={styles.price}>₹{item.price * item.quantity}</AppText>
      </View>
    </View>
  );



  return (
    <View style={styles.wrapper}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`user/restaurant/${restaurantId}`)}>
          <AppText variant="small" style={styles.actionText}>+ Add Items</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <AppText variant="small" style={styles.actionText}><PenLine size={10} /> Cooking requests</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 17,
    paddingVertical: 17,
  },

 row: {
  // backgroundColor: "#e7e7e7ff",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 14,
  paddingVertical: 10,   // instead of height: 80
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

  image: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },

  flex1: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },


  name: {
    lineHeight: 14,
    fontSize: 14,
    color: "#333",
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },

  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1, 
    borderColor: '#00b069ff', 
    backgroundColor: '#f5fffbff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
  },

  btn: {
    fontSize: 20,
    color: "green",
    paddingHorizontal: 6,
  },

  qtyText: {
    fontSize: 15,
    color: "#444",
    paddingHorizontal: 4,
  },

  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  actionRow: {
    marginTop: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 12,
  },

  actionBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  actionText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
   qtyBoxSmall: { flexDirection: 'row', width: 50, justifyContent: 'space-between', borderWidth: 1, borderColor: '#00b069ff', backgroundColor: '#f5fffbff', borderRadius: 8, alignItems:'center' },
    qtyBtnSmall: { color: '#00b069ff', fontSize: 18},
    qtyValSmall: { color: '#00b069ff', fontSize: 15 },
});