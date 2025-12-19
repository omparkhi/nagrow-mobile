import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";

export default function ETAInfoCard ({
    etaMinutes,
    remainingMeters,
    title = "Estimated Arrival",
}) {
    // Helper: Format distance (e.g., 1200m -> 1.2 km)
    const formatDistance = (meters) => {
        if (meters === undefined || meters === null) return "--";
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${meters} m`;
    };

    // Helper: Format time
    const formatTime = (mins) => {
        if (mins === undefined || mins === null) return "--";
        if (mins < 1) return "< 1 min";
        return `${mins} min`;
    }

    return (
    <View style={[styles.card]}>
      {/* Header / Title */}
      <View style={styles.header}>
        <AppText variant="small" style={styles.title}>{title}</AppText>
        {/* Animated Pulse Dot (Optional visual flair) */}
        <View style={styles.liveIndicator}>
            <View style={styles.dot} />
            <AppText variant="small" style={styles.liveText}>LIVE</AppText>
        </View>
      </View>

      <View style={styles.row}>
        {/* LEFT: Time */}
        <View style={styles.statItem}>
          <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="time-outline" size={24} color="#FF6D00" />
          </View>
          <View>
            <AppText variant="small" style={styles.value}>{formatTime(etaMinutes)}</AppText>
            <AppText variant="small" style={styles.label}>Time Remaining</AppText>
          </View>
        </View>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* RIGHT: Distance */}
        <View style={styles.statItem}>
          <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="navigate-outline" size={24} color="#2196F3" />
          </View>
          <View>
            <AppText variant="small" style={styles.value}>{formatDistance(remainingMeters)}</AppText>
            <AppText variant="small" style={styles.label}>Distance</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
    width: "90%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  liveText: {
    color: "#166534",
    fontSize: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontSize: 20,
    color: "#1E293B",
  },
  label: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
  },
});