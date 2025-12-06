  import { View, Text, TouchableOpacity, Image } from "react-native";
  import MapContainer from "./MapContainer";
  import PlaceAutocompleteInput from "./AutocompleteInput";
  import { useCurrentLocation } from "./useCurrentLocation";
  import { useState, useRef } from "react";
  import { router, useRouter } from "expo-router";
  import { getAddressFromCoords } from "@/utils/getAddressFromCoords";
  import { useEffect } from "react";
  import { Feather } from "@expo/vector-icons";
  import { useNavigation, useRoute } from "@react-navigation/native";
  import AppText from "@/components/AppText";
  import LottieView from "lottie-react-native";


  export default function MapPicker({ onSelect, latitude, longitude }) {
      const { location, loading } = useCurrentLocation();
      const [center, setCenter] = useState(
        latitude && longitude
          ? { lat: latitude, lng: longitude }
          : null
      );
      const [address, setAddress] = useState("");
      const navigation = useNavigation();
      const route = useRoute();

        // Reverse geocode initial location
  useEffect(() => {
    if (!center && location) {
      setCenter(location);
      (async () => {
        const addr = await getAddressFromCoords(location.lat, location.lng);
        setAddress(addr);
      })();
    }
  }, [location]);

  // Reverse geocode when center initially comes from props
useEffect(() => {
  if (center && !address) {
    (async () => {
      const addr = await getAddressFromCoords(center.lat, center.lng);
      setAddress(addr);
    })();
  }
}, [center]);


  const handleIdle = async (coords) => {
    setCenter(coords);
    const addr = await getAddressFromCoords(coords.lat, coords.lng);
    setAddress(addr);
  };


      const handleBack = () => {
    if (route.params?.from === "address-card") {
      navigation.navigate("user/dashboard/dash");
    } else {
      navigation.goBack();
    }
  };

        if (loading && !center) return <Text>Loading...</Text>;
  if (!center) return <Text>Initializing map...</Text>;


      return (
          <View style={{ flex: 1,  }}>
            {/* <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={handleBack} style={{  borderRadius: 30 }}>
           <Feather name="arrow-left" size={18} color="#000000ff" />
        </TouchableOpacity> */}
        <PlaceAutocompleteInput
          onSelect={({ lat, lng, address }) => {
            setCenter({ lat, lng });
            setAddress(address);
          }}
        />
        {/* </View> */}

        <View style={{ flex: 1, position: "relative" }}>
          <MapContainer
            center={center || location}
            onRegionChangeComplete={handleIdle}
            // zoomLevel={13}
          />

          <LottieView
            source={require("@/assets/Marker.json")}
            autoPlay
            loop
            style={{
              width: 60,
              height: 60,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -30 }, { translateY: -60 }],
              pointerEvents: "none",
            }}
          />
        </View>

        <View style={{position: "absolute",  backgroundColor: "#ffffffff" , bottom: 50, marginHorizontal: 18, borderRadius: 20, width: "90%",  shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 6, elevation: 3}}>
          <AppText variant="small" style={{ color: "#424040ff", paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f1dfd4d7" ,  borderTopLeftRadius: 20, borderTopRightRadius: 20  }}>Move map to select location</AppText>
          <AppText variant="light" style={{padding: 10, fontSize: 15, color: "#494646e2"}}>{address}</AppText>
            <View style={{ flexDirection: "row", gap: 3, margin: "auto", paddingBottom: 10 }}>
          <TouchableOpacity
            onPress={() => onSelect({ lat: center.lat, lng: center.lng, address })}
            style={{ padding: 12, backgroundColor: "#f06e10ff", marginTop: 8, width: "45%", borderRadius: 10 }}
          >
            <AppText variant="small" style={{ color: "white", textAlign: "center" }}>Save</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 12, backgroundColor: "red", marginTop: 8,  width: "45%", borderRadius: 10  }}
          >
            <AppText variant="small" style={{ color: "white", textAlign: "center" }}>Cancel</AppText>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }