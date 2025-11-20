import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";
import { useDispatch, useSelector } from "react-redux";
import { saveAddress } from "@/redux/slices/user/addressSlice";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SaveLocation() {
    const dispatch = useDispatch();
    const router = useRouter();
    const loading = useSelector((state) => state.address.loading);
    const [accessing, setAccessing] = useState(false);

    const handleSaveLocation = async () => {
        setAccessing(true);

        // request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied. Enable location to continue.");
            setAccessing(false);
            return;
        }

        try {
            const currLocation = await Location.getCurrentPositionAsync({});
            const latitude = currLocation.coords.latitude;
            const longitude = currLocation.coords.longitude;

            const res = await dispatch(
                saveAddress({
                    label: "Home",
                    latitude,
                    longitude,
                })
            );

            if (res.meta.requestStatus === "fulfilled") {
                alert("Location Saved Successfully");
                router.push("/user/dashboard/dash");
            } else {
                alert("Failed to save location");
            }
        } catch (err) {
            console.log("Location Error:", err);
            alert("Something went wrong");
        } finally {
            setAccessing(false);
        }
    };

    return (
    <View style={styles.container}>
      {(accessing || loading) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ff5733" />
          <AppText style={styles.loadingText}>Accessing Location...</AppText>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Access Location
        </AppText>
        <AppText variant="light" style={styles.headerSub}>
          We need your location to save your home address
        </AppText>
      </View>

      {/* MIDDLE CONTENT */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require("../../assets/Location.json")}
          autoPlay
          loop
          style={styles.lottie}
        />

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveLocation}
          activeOpacity={0.8}
        >
          <AppText variant="small" style={styles.btnText}>Access My Location</AppText>
          <Ionicons name="location" size={22} color="#fff" style={{ marginLeft: 8 }}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(113,113,113,0.55)",
    zIndex: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },

  header: {
    backgroundColor: "#131222",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: "center",
    
  },

  headerTitle: {
    color: "#fff",
    alignContent: "center",
    // fontSize: 34,
  },
  headerSub: {
    color: "#bdbdc7",
    fontSize: 20,
    marginTop: 5,
    textAlign: "center", 
  },

  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  lottie: {
    width: 500,
    height: 300,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff5733",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    // fontWeight: "700",
  },
});
