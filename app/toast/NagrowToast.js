import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "react-native";
import NaGrow from "@/assets/NaGrow.png";
import AppText from "@/components/AppText";

const NagrowToast = ({ text1 = "Notification", text2 = "Your order out for delivery" }) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Image source={NaGrow} style={styles.logo} />
        <View style={styles.text}>
          <AppText variant="small" style={styles.title}>{text1.toUpperCase()}</AppText>
          <AppText style={styles.message}>{text2}</AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#0f172a",
    paddingVertical: 10,
    paddingHorizontal: 15,
    // borderRadius: 10,
    elevation: 6,
    // borderLeftWidth: 5,

    // borderLeftColor: "#ff6d2d", // Swiggy / Zomato style
    // marginTop: 5,
    marginHorizontal: "auto"
  },
  subContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  title: { fontSize : 18, color: "#fff", top: 3},
  message: { fontSize : 13, color: "#d0ceceff", top: -3},
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  }
});

export default NagrowToast;
