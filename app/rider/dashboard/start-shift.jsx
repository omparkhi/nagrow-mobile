import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";

export default function StartShiftPopup({ visible, onConfirm, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.iconCircle}>
            <Ionicons name="bicycle-outline" size={28} color="#0f172a" />
          </View>

          <AppText style={styles.title}>Start Your Shift?</AppText>
          <AppText style={styles.sub}>
            You’re about to go online. Starting the shift will share your live location and allow the app to assign deliveries.
          </AppText>

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <AppText style={styles.cancelTxt}>Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.startBtn} onPress={onConfirm}>
              <AppText style={styles.startTxt}>Start Shift</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  box: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#111",
  },
  sub: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    // borderColor: "#ddd",
    paddingVertical: 12,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
    borderRadius: 12,
  },
  startBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 12,
  },
  cancelTxt: {
    textAlign: "center",
    fontSize: 15,
    color: "#111",
  },
  startTxt: {
    textAlign: "center",
    fontSize: 15,
    color: "#fff",
  },
});
