import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import AppText from "@/components/AppText";  
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"; 
import Foodies from "@/assets/foodies.json";  
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses } from "@/redux/slices/user/addressSlice";

export default function Banner() {
  const dispatch = useDispatch();
  const selectedAddress = useSelector((state) => state.address.selectedAddress);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, []); 
 
  return (
    <>
      {/* Header Gradient */}
      <LinearGradient
        colors={["#000000", "#141414", "#274563ff"]}
        style={styles.header}
      >
        {/* Top Bar */}
        <View style={styles.topRow}>
          <View style={{ width: "80%" }}>
            <TouchableOpacity style={styles.addressWrap}>
            <MaterialIcons name="home" size={22} color="white"  />
            <AppText variant="caption" color="white"  style={{ marginLeft: 2 }}>
              Home
            </AppText>
            <Feather name="chevron-down" size={22} color="#ccc" />
            </TouchableOpacity>

            <AppText variant="light" numberOfLines={1} ellipsizeMode="tail" style={styles.addressText}>
              {selectedAddress ? selectedAddress.formattedAddress : "Fetching location..."}
            </AppText>
          </View>
            
          

          

          <TouchableOpacity style={styles.profileIcon}>
            <Ionicons name="person" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Lottie Animation */}
        <View style={styles.lottieWrap}>
          <LottieView
            source={Foodies}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({

  addressText: {
  fontSize: 13  ,
  color: "#a6a2a2ff",
},

  header: {
    height: 260,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  addressWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileIcon: {
    backgroundColor: "#fff",
    width: 40,
    height: 32,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  lottieWrap: {
    justifyContent: "center",
    alignItems: "center",
    // marginTop: -10,
  },

  searchContainer: {
    marginTop: -170,
    flexDirection: "row",
    paddingHorizontal: 16,
  },

  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    height: 45,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },

  placeholderRow: {
    position: "absolute",
    left: 38,
    
    flexDirection: "row",
  },

  vegBox: {
    backgroundColor: "#fff",
    marginLeft: 8,
    paddingHorizontal: 5,
    // paddingVertical: 1,
    borderRadius: 8,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  toggle: {
    width: 37,
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 12,
    // marginTop: 1,
    marginTop: -4,
    padding: 2,
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: "#1fa71f",
  },

  toggleCircle: {
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});
