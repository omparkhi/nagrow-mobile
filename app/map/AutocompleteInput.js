import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;


export default function PlaceAutocompleteInput({ onSelect }) {

    return (
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
                key: GOOGLE_MAPS_API_KEY,
                language: "en",
                components: "country:in",
            }}
            styles={{
                container: { flex: 0 },
                textInput: {
                    borderRadius: 10,
                    borderColor: "#ccc",
                    borderWidth: 1,
                    padding: 10,
                    margin: 10,
                },
            }}
        />
    );
}