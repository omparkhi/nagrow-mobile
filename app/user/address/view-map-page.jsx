    import React, { useEffect, useState } from "react";
    import { View } from "react-native";
    import { useRoute, useNavigation } from "@react-navigation/native";
    import MapPicker from "@/app/map/MapPicker";
    import { useDispatch } from "react-redux";
    import { updateAddress, saveAddress } from "@/redux/slices/user/addressSlice";
    import { useRouter } from "expo-router";
    import { Text } from "react-native";
    import { useLocalSearchParams } from "expo-router";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";

    export default function ViewOnMapPage() {
        const { setVisible } = useBottomBarVisibility();
        const router = useRouter();
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const address = JSON.parse(params.address);
    const addressId = params.addressId;
    console.log("params:", params);



    const latitude = address?.coordinates?.coordinates[1];
    const longitude = address?.coordinates?.coordinates[0];
    
    useEffect(() => {
        console.log("prev lat, lng", latitude, longitude)
    }, [])

     useEffect(() => {
        setVisible(false);     
        return () => setVisible(true);  
      }, []);
    
    
    if (!addressId || !latitude || !longitude) {
    return <Text>Invalid or missing address data</Text>;
    }
    const handleSelect = async({ lat, lng, address: newAddr }) => {
        const payload = {
            fullAddress: newAddr,
            coordinates: { type: "Point", coordinates: [lng, lat] },
        };
        console.log("update address payload:", payload);
        dispatch(
            updateAddress({addressId, payload})
        ).unwrap()
        .then(() => router.back())
        .catch(err => console.error("Save address failed:", err));

    };

    return (
        <View style={{ flex: 1 }}>
        <MapPicker
        latitude={latitude}
  longitude={longitude}
  onSelect={(address) => handleSelect(address)}
            // initialAddress={currentAddress} // optional, in case you modify MapPicker to accept initialAddress
        />
        </View>
    );
    }
