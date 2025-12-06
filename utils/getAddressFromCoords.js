// utils/location.js
import * as Location from "expo-location";

export async function getAddressFromCoords(lat, lng) {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (!result) return "";
    return `${result.name || ""} ${result.street || ""}, ${result.city || ""}, ${result.region || ""}`.trim();
  } catch (error) {
    console.warn("Reverse geocode failed", error);
    return "";
  }
}
