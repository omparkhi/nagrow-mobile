import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Image, Switch, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
import NagrowToast from "@/app/toast/NagrowToast";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useLayoutConfig } from "@/app/context/LayoutContext";
import { router, useFocusEffect } from "expo-router";
import RootWrapper from "@/app/rootWrapper";
import RiderBanner from "./banner";
import RiderSidebar from "../rider-sidebar";
import StatsGrid from "./RiderStatsWidgets";
import LiveStatusWidget from "./LiveStatusWidget";
import { LinearGradient } from "expo-linear-gradient";
import RiderStickyHeader from "./StickyHeader";
import Footer from "@/app/user/Footer";
import RiderFooter from "../component/Footer";
import { useRiderBottomBarVisibility } from "@/app/context/RiderNavBarVisiblityContext";
import RiderDashboardSkeleton from "../component/RiderDashboardSkeleton";
// import { StatsGrid } from "./RiderStatsWidgets";

export default function RiderDash () {
  const dispatch = useDispatch();
  const { rider } = useSelector((state) => state.riderAuth);
  const { setIsImmersive, setBottomSafeColor } = useLayoutConfig();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setVisible } = useRiderBottomBarVisibility();
  const [refreshing, setRefreshing] = useState(false);

  const lastContentOffset = useRef(0);

  useFocusEffect(
    useCallback(() => {
      setIsImmersive(true);
      setBottomSafeColor("white"); // Set bottom bar to white if needed

      return () => {
        // 2. When Screen Unfocuses (Navigating away): Reset to Default
        setIsImmersive(false);
        setBottomSafeColor("white");
      };
    }, [])
  );

  useEffect(() => {
    dispatch(fetchRiderProfile());
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch your actions here and wait for them
      // Using .unwrap() is good practice with Redux Toolkit AsyncThunks to catch errors
      // console.log("refreshed dash")
      await dispatch(fetchRiderProfile()).unwrap(); 
      
      // If you have other data to refresh (like stats), add them here:
      // if (rider?._id) await dispatch(fetchTodayStats(rider._id));

    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      // 3. Stop refreshing whether successful or failed
      setRefreshing(false);
    }
  }, [dispatch, rider?._id]);

    useEffect(() => {
    console.log(rider)
  }, []);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastContentOffset.current;

    // SCROLL DOWN -> HIDE BAR
    // We use > 3 to avoid jittery movements
    if (diff > 3 && currentOffset > 0) {
        setVisible(false);
    } 
    // SCROLL UP -> SHOW BAR
    else if (diff < -3) {
        setVisible(true);
    }

    lastContentOffset.current = currentOffset;
  };


  // ... existing hooks ...
  // const [isInitializing, setIsInitializing] = useState(true);

  // // Fake a quick load to make the transition smooth (or tie this to actual data fetching)
  // useEffect(() => {
  //   const timer = setTimeout(() => setIsInitializing(false), 1500);
  //   return () => clearTimeout(timer);
  // }, []);

  // // ... existing logic ...

  // // ⚡ RETURN SKELETON IF LOADING
  // if (!isInitializing) {
  //   return (
  //     <RootWrapper immersive={true} barStyle="light" bottombar={true}>
  //   <View style={{ marginTop: insets.top  }}>  
  //     <RiderDashboardSkeleton />
  //   </View>
  //   </RootWrapper>
  //   )
  // }

    return (
    <RootWrapper immersive={true} barStyle="light" bottombar={true}>
      <LinearGradient start={{ x: 0.5, y: 0.5 }} end={{ x: 0.5, y: 1 }} colors={['#0f172a', '#0f172a58']} style={{ flex: 1 }} >
      <FlatList 
        data={[{ key: "main" }]}
        keyExtractor={item => item.key}
        renderItem={() => (
          <>
            <RiderBanner onMenuPress={() => setSidebarOpen(true)} />
            {rider?.isOnline ? <RiderShiftDashboard/> : <StartShiftModal/>}
            <LogoutButton/>
            
          </>
        )}
        ListHeaderComponent={<RiderStickyHeader />}
        // ListFooterComponent={<RiderFooter style={insets.bottom} />}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        refreshControl={
    <RefreshControl 
      refreshing={refreshing}      // 👈 Connect State
      onRefresh={onRefresh}        // 👈 Connect Handler
      colors={["#0f172a"]} 
      tintColor="#0f172a" 
      progressBackgroundColor="#fff" // Optional: Background for the loader circle
      progressViewOffset={100}
    />
  }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      </LinearGradient>
    </RootWrapper>
    )
};


const styles = StyleSheet.create({
  placeholder: { flex: 1, padding: 16 },
});




