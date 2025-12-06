import { View, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import StartShiftPopup from "./start-shift";
import { useEffect, useState } from "react";
import AppText from "@/components/AppText";
import RiderStartShift from "@/assets/Rider-Shift.json";
import useRiderLocation from "@/hooks/use-rider-location";
import { useSelector, useDispatch } from "react-redux";
import { fetchRiderProfile } from "@/redux/slices/rider/authSlice";
import { startShift, stopShift } from "@/redux/slices/rider/riderTrackingSlice";
import { ActivityIndicator } from "react-native-web";
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
    

    const confirmStart = () => {
        setPopup(false);
        setLoading(true);
        try {
          dispatch(startShift());
          dispatch(fetchRiderProfile());
        // console.log("Shift started → tracking enabled");
        } catch (err) {
          console.log("Error starting shift:", err);
        } finally {
          setLoading(false); // hide loader
        }
        
    };

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large"/>
        </View>
      )
    };

    return (
        <View style={{ flex: "column", alignItems: "center", marginTop: 30 }}>
        <View style={{ width: "100%", alignItems: "center"}}>
            <LottieView
            source={RiderStartShift}
            autoPlay
            loop
            style={{ width: 240, height: 240}}
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