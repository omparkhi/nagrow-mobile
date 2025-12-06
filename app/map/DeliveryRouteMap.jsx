import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";
import { View, Image, ActivityIndicator, TouchableOpacity, Easing } from "react-native";
import PolylineDecoder from "@mapbox/polyline";
import axios from "axios";
import { defaultMapStyles } from "./mapStyles";
import { useSelector, useDispatch } from "react-redux";
import { setRouteFitted, setRouteCache, setRouteFetched } from "@/redux/slices/map/mapSlice";
import { Platform } from "react-native";

// import { Easing } from "react-native";
// import LottieView from "lottie-react-native";
import { calBearing } from "@/utils/calBearing";
import { haversineDistance } from "@/utils/trackingUtils";
import { getSnapToRoadLocation } from "@/utils/snapUtils";

// CONSTANTS FOR STABILITY
const LATITUDE_DELTA = 0.0043;
const LONGITUDE_DELTA = 0.0034;
const MIN_DISTANCE_THRESHOLD = 5; // Meters: Ignore movements smaller than this (stops jitter)
const MIN_ROTATION_THRESHOLD = 10; // Meters: Only rotate bike if moved this far
const ANIMATION_DURATION = 2000; // Ms: Should match your backend socket update interval approx.

export default function DeliveryRouteMap({ origin, destination, riderLocation }) {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  // const routeFitted = useSelector((state) => state.mapState.routeFitted);

  // selector
  const { routeFetched, routeCache, routeFitted } = useSelector((s) => s.mapState);
  const persistedLast = useSelector((state) => state.riderLocation.lastLocation); // persisted last location (fallback)

  const { order, loading } = useSelector((state) => state.riderOrder);

  // Refs for logic
  const prevLocRef = useRef(null);
  const target = riderLocation;
  const lastBearingRef = useRef(0);

  //  local state
  const [bearing, setBearing] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [follow, setFollow] = useState(true); // follow mode: true -> camera follows rider; false -> user panned/zoomed

  // Smooth animated marker
  // Initialize AnimatedRegion
  // We use useRef to persist the Animated Value across renders
  const riderPos = useRef(
    new AnimatedRegion({
      latitude: persistedLast?.lat ?? origin?.lat,
      longitude: persistedLast?.lng ?? origin?.lng,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    })
  ).current;

  // compute duration (ms) based on meters distance
function durationForDistance(meters) {
  const base = 300;
  const ms = Math.min(1500, Math.max(base, meters * 60)); // tune multiplier
  return ms;
}


  const angleDiff = (a, b) => {
    let d = a - b;
    return ((((d + 180) % 360) + 360) % 360) - 180;
  };

 // fetch route only once (routeFitted persisted prevents re-fit after refresh)
  useEffect(() => {
  if (!origin || !destination) return;
  // If polyline already fetched earlier → use cache, skip API
  if (routeFetched && routeCache.length > 0) {
    setRouteCoords(routeCache);
    return;
  }

    let mounted = true;
    const loadRoute = async () => {
    try {
      const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${API_KEY}`
      );

      if (!mounted) return;

      const points = res.data.routes[0]?.overview_polyline?.points;
      const decoded = PolylineDecoder.decode(points);
      const coords = decoded.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoords(coords);
      dispatch(setRouteFetched());
      dispatch(setRouteCache(coords));

      // Fit route only if not fitted before
      if (!routeFitted) {
        setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
        dispatch(setRouteFitted());
      }, 500);
      }
    } catch (err) {
      console.log("Route error:", err);
    }
  };

  loadRoute();
  return () => { mounted = false; };
  }, [origin, destination]);

  // Rider Movement + Marker Animation
  useEffect(() => {
    if (!riderLocation?.lat || !riderLocation?.lng) return;
    if (routeCoords.length === 0) return;
    
    const newLat = riderLocation?.lat;
    const newLng = riderLocation?.lng;

    const snappedLoc = getSnapToRoadLocation(
      { lat: newLat, lng: newLng },
      routeCoords
    );

    const prev = prevLocRef.current;

    // --- 🔴 THE FIX: HANDLE NULL PREVIOUS LOCATION 🔴 ---
    // If this is the first location update, 'prev' is null. 
    // We cannot calculate distance or bearing yet.
    if (!prev) {
      prevLocRef.current = snappedLoc; // Set the ref
      // Immediately move marker to the starting position (no animation duration)
      riderPos.timing({
          latitude: snappedLoc.lat,
          longitude: snappedLoc.lng,
          duration: 0, 
          useNativeDriver: false
      }).start();
      return; // Stop here to prevent the crash
    }

    // A. Calculate Distance moved
    const distanceMoved = haversineDistance(prev, snappedLoc);
    // const duration = durationForDistance(meters);

    // B. JITTER FILTER: If moved less than 5 meters, ignore it.
    // This stops the "mosquito" effect when the rider is idle.
    if (distanceMoved < MIN_DISTANCE_THRESHOLD) {
      return; 
    }

    // C. BEARING SMOOTHING: Only calculate new angle if moved significantly (>10m)
    // This stops the bike from spinning 360 degrees on small drifts.
    let newRotation = lastBearingRef.current;
    if (distanceMoved > MIN_ROTATION_THRESHOLD) {
      newRotation = calBearing(prev, snappedLoc);
      setBearing(newRotation);
      lastBearingRef.current = newRotation;
    }
    
    // const distance = Math.abs(angleDiff(newBearing, lastBearingRef.current));

    // if (distance < 120) {
      
    // }

    // Marker animation

    // D. SMOOTH ANIMATION
    // Android requires specific handling for smooth marker movement
    if (Platform.OS === 'android') {
      if (riderPos) {
    riderPos.timing(
      {
        latitude: snappedLoc.lat, // Use Snapped
        longitude: snappedLoc.lng, // Use Snapped
        duration: ANIMATION_DURATION, // Fixed duration is smoother than dynamic for delivery
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }
    ).start();
  }
  } else {
      // iOS
      riderPos.timing({
        latitude: snappedLoc.lat,
        longitude: snappedLoc.lng,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }

    // E. CAMERA FOLLOW
    if (follow) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: snappedLoc.lat,
            longitude: snappedLoc.lng,
          },
          pitch: 45,
          heading: newRotation,
          zoom: 17,
        },
        { duration: ANIMATION_DURATION } // Match marker duration
      );
    }

    // Update Ref with the SNAPPED location so next calculation is relative to the road
    prevLocRef.current = snappedLoc;
  }, [riderLocation, routeCoords]);  // Only run when riderLocation updates

  if (!origin || !destination) return null;

  // const isRiderOrigin =
  // riderLocation &&
  // origin.lat === riderLocation.lat &&
  // origin.lng === riderLocation.lng;

  // const hideRestaurantMarker = ["pick_up_by_rider", "on the way", "delivered"].includes(order?.status);


// if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return;

  // if (!origin || !destination) {
  //   return (
  //     <View style={{ height: 350, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <View>
      <MapView
      ref={mapRef}
      style={{ width: "100%", height: 400, borderRadius: 16 }}
      onPanDrag={() => setFollow(false)}
      customMapStyle={defaultMapStyles}
      initialRegion={{
        latitude: origin.lat,
        longitude: origin.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }}
    >

      {riderLocation ? <></> :
      <Marker coordinate={{ latitude: origin.lat, longitude: origin.lng }} title="Start" />
      }
      <Marker coordinate={{ latitude: destination.lat, longitude: destination.lng }} title="Destination" />

      {/* Rider Moving Marker */}
      {(riderLocation || persistedLast) && (
        <Marker.Animated
          coordinate={riderPos}
          anchor={{ x: 0.5, y: 0.5 }} // Center the icon
          flat={true} // Makes it stick to map surface, not billboard
          style={{
            transform: [{ rotate: `${bearing}deg` }] // Apply rotation to style, rarely prop
          }}
        >
          <Image
            source={require("@/assets/rider-bike.png")}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
        </Marker.Animated>   
)}
      {/* Route polyline */}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeWidth={4}
          strokeColor="#FF6D00"
        />
      )}
    </MapView>

    {/* Re-center Button */}
      {!follow && (
        <TouchableOpacity
          onPress={() => {
            setFollow(true);
            // Immediate snap back
            const t = riderLocation || persistedLast;
            if (t) {
                mapRef.current?.animateCamera({
                    center: { latitude: t.lat, longitude: t.lng },
                    heading: bearing,
                    zoom: 17,
                    pitch: 45
                }, { duration: 500 });
            }
          }}
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 30,
            elevation: 5,
          }}
        >
          <Image source={require("@/assets/Home-Marker.png")} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}