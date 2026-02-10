import React, { useMemo } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import DeliveryRouteMap from "@/app/map/DeliveryRouteMap";
import ETAInfoCard from "../ETAInfoCard";

const MapView = ({ order, riderCoords, routeOrigin, routeDestination, restaurantLocation, customerLocation, eta, remainingMeters, onNavigate }) => {
    // Memoize Locations to prevent calculation on every render
    // const mapProps = useMemo(() => {
    //     return {
    //         origin: {
    //             lat: order.restaurantId.address.location.coordinates[1],
    //             lng: order.restaurantId.address.location.coordinates[0]
    //         },
    //         destination: {
    //             lat: order.deliveryAddress.coordinates[1],
    //             lng: order.deliveryAddress.coordinates[0]
    //         }
    //     };
    // }, [order?._id]); // Only recalculate if Order ID changes

    if (!riderCoords) {
      return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <DeliveryRouteMap 
                routeOrigin={routeOrigin}
                routeDestination={routeDestination}
                restaurantLocation={restaurantLocation}
                customerLocation={customerLocation}
                riderLocation={riderCoords}
                order={order}
            />

            {/* <TouchableOpacity style={{ position: 'absolute', top: 50, right: 16, zIndex: 20, alignItems: 'center' }} onPress={onNavigate} activeOpacity={0.8}>
                <View style={styles.navIconContainer}>
                    <Ionicons name="navigate" size={28} color="#fff" style={{ transform: [{rotate: '-45deg'}] }} />
                </View>
                <AppText variant="small" style={styles.navText}>Map</AppText>
            </TouchableOpacity> */}

            <View style={styles.etaCard}>
                <ETAInfoCard title="Arriving in.." etaMinutes={eta} remainingMeters={remainingMeters} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navFab: { position: 'absolute', top: 50, right: 16, zIndex: 20, alignItems: 'center' },
  navIconContainer: { width: 55, height: 55, borderRadius: 30, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 2, borderColor: '#fff' },
  navText: { color: '#0f172a', fontSize: 12, fontWeight: '700', marginTop: 4, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
  etaCard: { position: 'absolute', top: 370, width: '100%', alignItems: 'center' }
});

export default React.memo(MapView, (prev, next) => {
    return (
        prev.riderCoords?.lat === next.riderCoords?.lat &&
        prev.riderCoords?.lng === next.riderCoords?.lng &&
        prev.eta === next.eta
    );
});