import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { saveAddress } from "@/redux/slices/user/addressSlice";
import { useCurrentLocation } from "@/app/map/useCurrentLocation";
import MapPicker from "@/app/map/MapPicker";
import AppText from "@/components/AppText";
import { useDispatch } from "react-redux";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";

export default function CurrentLocationPage () {
    const { setVisible } = useBottomBarVisibility();
    const dispatch = useDispatch();
    const router = useRouter();
    const  { loading, location } = useCurrentLocation();

         useEffect(() => {
        setVisible(false);     
        return () => setVisible(true);  
      }, []);

    if (loading || !location) return <AppText>Detecting Location...</AppText>



   const handleSelect = ({ address }) => {
  if (!location) return;

  const payload = {
    label: "New",
    latitude: location.lat,      // fix here
    longitude: location.lng,     // fix here
    fullAddress: address,
  };
console.log("Saving address payload:", payload);

  dispatch(saveAddress(payload))
    .unwrap()
    .then(() => router.back())
    .catch(err => console.error("Save address failed:", err));
};



    return (
        <MapPicker
            onSelect={handleSelect}
        />
    )
}