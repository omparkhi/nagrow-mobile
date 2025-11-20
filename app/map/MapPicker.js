import { View, Text, TouchableOpacity, Image } from "react-native";
import MapContainer from "./MapContainer";
import PlaceAutocompleteInput from "./AutocompleteInput";
import { useCurrentLocation } from "./useCurrentLocation";
import { useState, useRef } from "react";

export default function MapPicker({ onSelect }) {
    const { location, loading } = useCurrentLocation();
    const [center, setCenter] = useState(null);
    const [address, setAddress] = useState("");

    const handleIdle  = async (coords) => {
        setCenter(coords);
        const address = await getAddressFromCoords(coords.lat, coords.lng);
        setAddress(address);
    }

    if (loading) return <Text>Loading location...</Text>;
    if (!location) return <Text>No location</Text>;

    return (
        <View style={{ flex: 1 }}>
      <PlaceAutocompleteInput
        onSelect={({ lat, lng, address }) => {
          setCenter({ lat, lng });
          setAddress(address);
        }}
      />

      <View style={{ flex: 1 }}>
        <MapContainer
          center={center || location}
          onRegionChangeComplete={handleIdle}
        />

        <Image
          source={require("@/assets/MapMarker.png")}
          style={{
            width: 40,
            height: 40,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -20 }, { translateY: -40 }],
          }}
        />
      </View>

      <View style={{ padding: 16, backgroundColor: "white" }}>
        <Text>{address || "Move map to select location"}</Text>

        <TouchableOpacity
          onPress={() => onSelect({ ...center, address })}
          style={{ padding: 12, backgroundColor: "green", marginTop: 8 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}