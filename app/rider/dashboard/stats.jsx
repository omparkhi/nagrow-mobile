import react from "react";
import AppText from "@/components/AppText";
import { View } from "react-native";
import { StyleSheet } from "react-native";

export default function Stats() {
    return (
        <>
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <AppText variant="small" style={styles.statLabel}>Earnings</AppText>
                    <AppText variant="small" style={styles.statValue}>₹ 200</AppText>
                </View>
                <View style={styles.statCard}>
                    <AppText variant="small" style={styles.statLabel}>Orders</AppText>
                    <AppText variant="small" style={styles.statValue}>6</AppText>
                </View>
                <View style={styles.statCard}>
                    <AppText variant="small" style={styles.statLabel}>Rating</AppText>
                    <AppText variant="small" style={styles.statValue}>3.2</AppText>
                </View>
            </View> 
        </>
    )
} 

const styles = StyleSheet.create({
    statsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 14,
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },

  statLabel: {
    fontSize: 15,
    color: "#0f1b2b",
    opacity: 0.9,
  },

  statValue: {
    marginTop: 6,
    fontSize: 18,
    color: "#0f1b2b",
  },
  
})