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
    <>
    <View style={styles.row}>
<View style={styles.middle}>
  {/* Title Row */}
  <View style={styles.titleRow}>
    <FoodType item={item} />
    <AppText variant="small" style={styles.name}>
      {item.name}
    </AppText>
  </View>

  {/* Addons BELOW name */}
  {item.selectedAddons?.length > 0 && (
    <View style={styles.addonBlock}>
        <AppText style={styles.addonText}>
          {item.selectedAddons.map(a => a.name).join(", ")}
        </AppText>
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
    
    </>
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
  // alignItems: "center",
  alignItems: "flex-start",
  justifyContent: "space-between",
  paddingHorizontal: 14,
  paddingTop: 10, 
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
    flexDirection: "column",
    alignItems: "center",
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
    // flex: 1,
    
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
    middle: {
  flex: 1,
  marginLeft: 10,
},

titleRow: {
  flexDirection: "row",
  alignItems: "center", // aligns FoodType + name properly
  gap: 6,
},

addonBlock: {
  marginTop: 2,
  marginLeft: 18, // aligns addons under name, not icon
  flexDirection: "column",   // 🔴 IMPORTANT
  alignItems: "flex-start",
},

addonText: {
  fontSize: 10,
  color: "#666666ff",
  lineHeight: 14,
},

});