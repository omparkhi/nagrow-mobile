import { Alert, View } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import LottieView from "lottie-react-native";
import StartShiftPopup from "./start-shift";
import { useEffect, useState } from "react";
import AppText from "@/components/AppText";
import RiderStartShift from "@/assets/Rider-Shift.json";
import NewDelivery from "@/assets/New-Delivery.json";
import useRiderLocation from "@/hooks/use-rider-location";
import { useSelector, useDispatch } from "react-redux";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";
import { startShift, stopShift } from "@/redux/slices/rider/riderTrackingSlice";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import * as Location from 'expo-location';
import RiderDashboardSkeleton from "../component/RiderDashboardSkeleton";
// import useRiderLocation from "@/hooks/use-rider-location";

export default function StartShiftModal() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
    const { rider } = useSelector(state => state.riderAuth);
    const riderId = rider?._id;
    const isTracking = useSelector((state) => state.riderTracking.isTracking);
    const [popup, setPopup] = useState(false);
    const handleStartDelivery = () => setPopup(true);



    // useEffect(() => {
    //   console.log("rider info on shift start:", rider);
    // }, []);
    

    const confirmStart = async () => {
        setPopup(false);
        setLoading(true);
        try {
          console.log("Getting GPS for Shift Start...");
          
          // 1. Check current status
          let { status } = await Location.getForegroundPermissionsAsync();
          
          // 2. If not granted, ASK for it
          if (status !== 'granted') {
            const permissionResponse = await Location.requestForegroundPermissionsAsync();
            status = permissionResponse.status; // 👈 UPDATE the status variable here!
          }

          // 3. Now check the FINAL status
          if (status !== 'granted') {
            Alert.alert("Permission Denied", "We need your location to start the shift.");
            setLoading(false);
            return;
          }

          // 4. Get Coords
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });

          const currentCoords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };

          console.log("✅ Got Coords:", currentCoords);
          
          // 5. Send to API
          const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/rider/start/shift`,
            {
              riderId,
              coords: currentCoords,
              fcmToken: rider?.fcmToken
            }
          );
          
          console.log(res.data);
          dispatch(startShift());
          dispatch(fetchRiderProfile()).unwrap();
          console.log("Shift started → tracking enabled");

        } catch (err) {
          console.log("Error starting shift:", err.message);
          Alert.alert("Error", "Could not start shift. Check GPS or Internet.");
        } finally {
          setLoading(false);
        }
    };

    if (loading) {
      return (
        <RiderDashboardSkeleton />
      )
    };

    return (
        <View style={{ flex: "column", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 12, borderRadius: 15, paddingBottom: 10 }}>
        <View style={{ width: "100%", alignItems: "center"}}>
            <LottieView
            source={NewDelivery}
            autoPlay
            loop
            style={{ width: 200, height: 200}}
        />
        </View>
        <TouchableOpacity
            style={{
                width: "60%",
                // marginTop: 20,
                backgroundColor: "#0f172a",
                paddingVertical: 13,
                borderRadius: 10,
                alignItems: "center",
            }}
            onPress={handleStartDelivery}
        >
        <AppText style={{ color: "#fff", fontSize: 16 }}>
          Start Shift
        </AppText>
      </TouchableOpacity>

      <StartShiftPopup
        visible={popup}
        onClose={() => setPopup(false)}
        onConfirm={confirmStart}
      />
      
        </View>
    )
}