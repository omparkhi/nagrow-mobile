import MapView from "react-native-maps";
import { View, StyleSheet } from "react-native";
import { useRef } from "react";

export default function MapContainer({ center, zoom = 16, children, onRegionChangeComplete }) {
    const mapRef = useRef(null);

    return (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            onRegionChangeComplete={(region) => {
                onRegionChangeComplete?.({
                    lat: region.latitude,
                    lng: region.longitude,
                });
            }}
        >
            {children}
        </MapView>
    );
}