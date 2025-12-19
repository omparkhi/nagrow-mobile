import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";
import { View, Image, TouchableOpacity, Animated, Platform, Easing } from "react-native";
import PolylineDecoder from "@mapbox/polyline";
import { defaultMapStyles } from "./mapStyles";
import { useSelector, useDispatch } from "react-redux";
import { setRouteFitted, setRouteCache, setRouteFetched } from "@/redux/slices/map/mapSlice";
import { calBearing } from "@/utils/calBearing";
import { getSnapToRoadLocation } from "@/utils/snapUtils";

// CONSTANTS
const LATITUDE_DELTA = 0.0043;
const LONGITUDE_DELTA = 0.0034;
const ANIMATION_DURATION = 2000;

export default function DeliveryRouteMap({ origin, destination, riderLocation, order }) {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  
  // Redux Selectors
  const { routeFetched, routeCache, routeFitted } = useSelector((s) => s.mapState);
  const persistedLast = useSelector((state) => state.riderLocation.lastLocation);

  // State & Refs
  const prevLocRef = useRef(null);
  const [bearing, setBearing] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [follow, setFollow] = useState(true);

  // 1. PULSE ANIMATION (Corrected)
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // 🔴 REQUIRED FALSE for Map Markers on Android
      })
    ).start();
  }, []);

  // Animated Coordinate for Smooth Movement
  const riderPos = useRef(
    new AnimatedRegion({
      latitude: persistedLast?.lat ?? origin?.lat,
      longitude: persistedLast?.lng ?? origin?.lng,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    })
  ).current;

  // --- ROUTE FETCHING ---
  useEffect(() => {
    if (!origin || !destination) return;

    const fitMap = (coords) => {
        if (!routeFitted && mapRef.current) {
            setTimeout(() => {
                mapRef.current?.fitToCoordinates(coords, {
                    edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                    animated: true,
                })
                dispatch(setRouteFitted());
            }, 500);
        }
    };

    if (order?.routeInfo?.polyline) {
        const points = order.routeInfo.polyline;
        const decoded = PolylineDecoder.decode(points);
        const coords = decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
        dispatch(setRouteCache(coords));
        dispatch(setRouteFetched());
        fitMap(coords);
    }
  }, [order?.routeInfo?.polyline]);


  // --- RIDER LOGIC (Point to Destination) ---
  useEffect(() => {
    if (!riderLocation?.lat || !riderLocation?.lng) return;
    if (routeCoords.length === 0) return;
    
    // 1. Snap to road
    const snappedLoc = getSnapToRoadLocation(riderLocation, routeCoords);
    
    // 2. Animate Marker Position
    if (Platform.OS === 'android') {
        riderPos.timing({
            latitude: snappedLoc.lat,
            longitude: snappedLoc.lng,
            duration: ANIMATION_DURATION,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start();
    } else {
        riderPos.timing({
            latitude: snappedLoc.lat,
            longitude: snappedLoc.lng,
            duration: ANIMATION_DURATION,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start();
    }

    // 3. 🔴 FIX: CALCULATE BEARING TO DESTINATION
    // Instead of looking at history (which makes it spin), look at the goal.
    // This keeps the head steady towards the destination.
    const newBearing = calBearing(snappedLoc, destination);
    setBearing(newBearing);

    // 4. Camera Follow
    if (follow) {
      mapRef.current?.animateCamera({
        center: { latitude: snappedLoc.lat, longitude: snappedLoc.lng },
        pitch: 45,
        heading: newBearing , // Rotates map to face destination (GPS Style)
        zoom: 17,
      }, { duration: ANIMATION_DURATION });
    }

    prevLocRef.current = snappedLoc;
  }, [riderLocation, routeCoords]); // Added destination to dependency


  if (!origin ) return null;

  return (
    <View>
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: 440, borderRadius: 16 }}
        onPanDrag={() => setFollow(false)}
        customMapStyle={defaultMapStyles}
        initialRegion={{
          latitude: origin.lat,
          longitude: origin.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        
        {/* 1. RESTAURANT (Start) */}
        <Marker 
            coordinate={{ latitude: origin.lat, longitude: origin.lng }} 
            title="Restaurant"
            anchor={{ x: 0.5, y: 1 }} // Pin tip
        >
             <Image source={require("@/assets/Restaurant-Marker.png")} style={{ width: 45, height: 45 }} resizeMode="contain" />
        </Marker>

        {/* 2. HOME (End) */}
        <Marker 
            coordinate={{ latitude: destination?.lat, longitude: destination?.lng }} 
            title="Home"
            anchor={{ x: 0.5, y: 1 }} // Pin tip
        >
             <Image source={require("@/assets/Home-Marker.png")} style={{ width: 45, height: 45 }} resizeMode="contain" />
        </Marker>

        {/* 3. RIDER (The Hero) */}
        {order?.riderId && riderLocation && (
          <Marker.Animated
            coordinate={riderPos}
            anchor={{ x: 0.5, y: 0.5 }} // Center of 150x150 box
            flat={true} // Lies flat on road
            rotation={bearing} // Points to destination
            style={{
                width: 150, // Big invisible touch target
                height: 150, 
                justifyContent: 'center', 
                alignItems: 'center',
                zIndex: 999, // Force on top
                elevation: 10, // Android force on top
            }}
          >
            {/* PULSE (Bottom Layer) */}
            <Animated.View
              style={{
                position: "absolute",
                width: 50, height: 50, borderRadius: 25,
                backgroundColor: "rgba(255, 109, 0, 0.5)", 
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
                opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 0.3, 0] }),
              }}
            />
            {/* BIKE (Top Layer) */}
            <Image
              source={require("@/assets/Rider_Bike.png")}
              style={{ width: 60, height: 60 }} 
              resizeMode="contain"
            />
          </Marker.Animated>
        )}

        {/* ROUTE LINE */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#FF6D00" />
        )}
      </MapView>

      {/* RE-CENTER BUTTON */}
      {!follow && (
        <TouchableOpacity
          onPress={() => setFollow(true)}
          style={{ position: "absolute", right: 12, bottom: 12, backgroundColor: "#fff", padding: 10, borderRadius: 30, elevation: 5 }}
        >
          <Image source={require("@/assets/Home-Marker.png")} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </TouchableOpacity>
      )}
    </View>
  );
}