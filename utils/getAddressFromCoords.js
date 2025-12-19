// utils/location.js
import * as Location from "expo-location";

export async function getAddressFromCoords(lat, lng) {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      const req = await Location.requestForegroundPermissionsAsync();
      if (req.status !== "granted") {
        console.warn("Location permission denied");
        return "";
      }
    }

    const [result] = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (!result) return "";

    return [
      result.name,
      result.street,
      result.city,
      result.region,
    ]
      .filter(Boolean)
      .join(", ");
  } catch (error) {
    console.warn("Reverse geocode failed", error);
    return "";
  }
}
