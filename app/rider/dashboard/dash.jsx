import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { connectSocket, getSocket } from "@/services/connectSocket";
import { useToast } from "@/app/ToastContext";
import AppText from "@/components/AppText";
import RiderHeader from "../rider-header";
import LogoutButton from "./logout-button";
import Stats from "./stats";
import StartShiftModal from "./start-shift-modal";
import { useSelector, useDispatch } from "react-redux";
import RiderShiftDashboard from "./rider-shift";
import { stopShift } from "@/redux/slices/rider/riderTrackingSlice";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";

export default function RiderDash () {
  const dispatch = useDispatch();
  const { rider } = useSelector((state) => state.riderAuth);

  useEffect(() => {
    dispatch(fetchRiderProfile());
  }, []);

    useEffect(() => {
    console.log(rider)
  }, []);

    return (
    <View style={{ height: "100%", backgroundColor: "#fff" }}>
    {/* <Stats/> */}
    {rider?.isOnline ? <RiderShiftDashboard/> : <StartShiftModal/>}
      <LogoutButton/>
    </View>
    )
};


const styles = StyleSheet.create({
  placeholder: { flex: 1, padding: 16 },
});




