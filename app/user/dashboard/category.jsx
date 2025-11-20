import React, { useRef } from "react";
import { View, ScrollView, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons"; 
import AppText from "@/components/AppText";
import CategoryItem from "./categoryItem";

const Category = () => {
  
  return (
    <View style={styles.container}>
      <AppText variant="small" style={styles.title}>What's in your mind?</AppText>

      <View style={styles.row}>

        {/* SCROLLABLE LIST */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {CategoryItem.map((item) => (
            <View key={item.id} style={styles.item}>
              <Image source={item.image} style={styles.image} />
              <AppText style={styles.label}>{item.name}</AppText>
            </View>
          ))}
        </ScrollView>

        {/* RIGHT BUTTON */}
        {/* <TouchableOpacity style={styles.btnRight} onPress={() => scroll(500)}>
          <Feather name="chevron-right" size={22} color="#333" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    marginTop: 130,
    // paddingHorizontal: 10,
  },
  title: {
    // fontSize: 15,
    // fontWeight: "700",
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 8,
    color: "#555",
  },
  row: {
    position: "relative",
    justifyContent: "center",
  },
  
  item: {
    alignItems: "center",
    justifyContent: "center",
    width: 65,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  label: {
    marginTop: -9,
    fontSize: 13,
    color: "#515966",
    fontWeight: "600",
    textAlign: "center",
  },
  btnLeft: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  btnRight: {
    position: "absolute",
    right: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
});
