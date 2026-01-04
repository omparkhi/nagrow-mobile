import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";

export default function StartDeliveryPopup({ visible, onClose, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* BACKDROP */}
      <BlurView intensity={45} tint="light" style={styles.backdrop}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      </BlurView>

      {/* CARD */}
      <View style={styles.centerWrap}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="bicycle-outline" size={40} color="#0f172a" />
          </View>

          <AppText style={styles.title}>Start Delivery?</AppText>

          <AppText style={styles.subText}>
            You’re about to begin this order. Make sure you are ready before you
            continue.
          </AppText>

          {/* BUTTONS */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.startBtn} onPress={onConfirm}>
              <AppText style={styles.startText}>Start</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  iconWrap: {
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#0f172a",
    marginBottom: 8,
  },

  subText: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  btnRow: {
    flexDirection: "row",
    marginTop: 22,
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },

  cancelText: {
    color: "#334155",
    fontSize: 15,
  },

  startBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },

  startText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
