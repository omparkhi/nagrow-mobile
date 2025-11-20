import * as Location from "expo-location";
import { useEffect, useState } from "react";


export const useCurrentLocation = (fallback = { lat: 21.1458, lng: 79.0882 }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLocation(fallback);
                setLoading(false);
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            setLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            });

            setLoading(false);  
        }) ();
    }, []);

    return { location, loading };
};
