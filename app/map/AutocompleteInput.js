import { View, Platform } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

export default function PlaceAutocompleteInput({ onSelect }) {
  return (
    <View style={{ position: "absolute", top: 10, left: 0, right: 0, zIndex: 9999, elevation: 10 }}>
      <GooglePlacesAutocomplete
        placeholder="Search location..."
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (!details) return;
          onSelect({
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            address: details.formatted_address,
          });
        }}
        query={{
          key: "AIzaSyAfvX27A0W1lFddDZF4IKVNmsmOWeh-yuo",
          language: "en",
          components: "country:in",
        }}
        textInputProps={{
          placeholderTextColor: "#797878ff",
        }}
        styles={{
          container: {
            flex: 0,
          },
          textInput: {
            height: 48,
            borderRadius: 10,
            borderColor: "#ccc",
            borderWidth: 1,
            paddingHorizontal: 12,
            fontSize: 16,
            color: "#000",
            backgroundColor: "#fff",
          },
          listView: {
            zIndex: 9999,
            elevation: Platform.OS === "android" ? 10 : undefined,
            backgroundColor: "#fff",
          },
        }}
      />
    </View>
  );
}
