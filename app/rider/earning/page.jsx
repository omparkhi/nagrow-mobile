import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchRiderEarnings } from "@/redux/slices/rider/riderEarningSlice";
import AppText from "@/components/AppText";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useHeaderVisibility } from "@/app/context/HeaderVisibilityContext";
import { useRouter } from "expo-router";

export default function RiderEarningsScreen() {
  const router = useRouter();
  const { setVisible } = useHeaderVisibility();

  useEffect(() => {
  setVisible(false);     // Hide header
  return () => setVisible(true);  // Show header again when leaving page
  }, []);

  const dispatch = useDispatch();
  const { earnings, payouts, loading } = useSelector(
    (state) => state.riderEarning
  );

  useEffect(() => {
    dispatch(fetchRiderEarnings());
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* WALLET HERO */}
      <View style={styles.hero}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
            >
                <Ionicons name="arrow-back" size={20} color="#94a3b8" />
            </TouchableOpacity>
            <AppText variant="small" style={styles.heroLabel}>AVAILABLE BALANCE</AppText>
        </View>
        <View style={styles.heroRow}>
          <MaterialIcons name="currency-rupee" size={38} color="#fff" />
          <AppText variant="small" style={styles.heroAmount}>
            {earnings.currentBalance}
          </AppText>
        </View>
        <AppText variant="small" style={styles.heroSub}>
          Withdrawable amount
        </AppText>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <StatCard
          label="Total Earned"
          value={earnings.totalEarnings}
          icon="wallet-outline"
          color="#16a34a"
        />
        <StatCard
          label="Paid Out"
          value={earnings.totalPaidOut}
          icon="cash-outline"
          color="#2563eb"
        />
      </View>

      {/* PAYOUT HISTORY */}
      <View style={styles.section}>
        <AppText variant="small" style={styles.sectionTitle}>Payout History</AppText>

        {payouts.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={payouts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <PayoutItem item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({ label, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <AppText variant="small" style={styles.statLabel}>{label}</AppText>
    <AppText variant="small" style={styles.statValue}>₹ {value}</AppText>
  </View>
);

const PayoutItem = ({ item }) => {
  const date = new Date(item.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <View style={styles.payoutRow}>
      <View>
        <AppText variant="small" style={styles.payoutAmount}>₹ {item.amount}</AppText>
        <AppText variant="small" style={styles.payoutDate}>{date}</AppText>
      </View>

      <View style={styles.payoutRight}>
        <AppText variant="small" style={styles.payoutMethod}>
          {item.method.toUpperCase()}
        </AppText>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.status === "success" ? "#16a34a" : "#ef4444" }
          ]}
        />
      </View>
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.empty}>
    <Ionicons name="wallet-outline" size={48} color="#94a3b8" />
    <AppText variant="small" style={styles.emptyTitle}>No payouts yet</AppText>
    <AppText variant="small" style={styles.emptySub}>
      Your withdrawals will appear here
    </AppText>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  hero: {
    backgroundColor: "#0f172a",
    paddingVertical: 25,
    paddingLeft: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },

  heroLabel: {
    color: "#94a3b8",
    fontSize: 14,
    letterSpacing: 1
  },

  heroRow: {
    marginTop: -5,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6
  },

  heroAmount: {
    marginTop: -3,
    color: "#fff",
    fontSize: 42,
    marginLeft: 4
  },

  heroSub: {
    marginTop: -10,
    color: "#64748b",
    fontSize: 13
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: -32
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },

  statLabel: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 12
  },

  statValue: {
    marginTop: 4,
    fontSize: 20,
    color: "#0f172a"
  },

  section: {
    padding: 16
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: "#0f172a"
  },

  payoutRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  payoutAmount: {
    fontSize: 16,
    color: "#0f172a"
  },

  payoutDate: {
    fontSize: 12,
    color: "#94a3b8"
  },

  payoutRight: {
    flexDirection: "row",
    alignItems: "center"
  },

  payoutMethod: {
    fontSize: 12,
    color: "#334155",
    marginRight: 8
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },

  empty: {
    alignItems: "center",
    marginTop: 40
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b"
  },

  emptySub: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4
  }
});
