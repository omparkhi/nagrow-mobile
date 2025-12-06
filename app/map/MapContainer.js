import MapView from "react-native-maps";
import { StyleSheet } from "react-native";
import { useRef, useEffect } from "react";
import { defaultMapStyles } from "./mapStyles";

export default function MapContainer({ center, children, onRegionChangeComplete }) {
  const mapRef = useRef(null);

  useEffect(() => {
  if (mapRef.current && center) {
    if (
      !mapRef.current.lastCenter ||
      Math.abs(mapRef.current.lastCenter.lat - center.lat) > 0.00001 ||
      Math.abs(mapRef.current.lastCenter.lng - center.lng) > 0.00001
    ) {
      mapRef.current.lastCenter = center;
      mapRef.current.animateToRegion(
        {
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.0015,
          longitudeDelta: 0.0015,
        },
        500
      );
    }
  }
}, [center]);


  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.0015,
        longitudeDelta: 0.0015,
      }}
      onRegionChangeComplete={(region) => {
        onRegionChangeComplete?.({
          lat: region.latitude,
          lng: region.longitude,
        });
        console.log("Map moved! Current center:", region.latitude, region.longitude);
      }}
      // customMapStyle={defaultMapStyles}
    >
      {children}
    </MapView>
  );
}
