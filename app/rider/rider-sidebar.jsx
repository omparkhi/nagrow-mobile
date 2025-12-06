// components/RiderSidebar.jsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { logout } from "@/redux/slices/rider/authSlice";
import { useDispatch } from "react-redux";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function RiderSidebar({ visible, onClose, navigation }) {
    const dispatch = useDispatch();

    const handleLogout = () => {
    dispatch(logout());
    router.replace("/rider-login");
  };
  const slideAnim = new Animated.Value(-SCREEN_WIDTH); // hidden initially

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -SCREEN_WIDTH,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <Ionicons name="speedometer-outline" size={22} color="#fff" />,
      route: "/rider/dashboard/dash",
    },
    {
      label: "My Orders",
      icon: <Ionicons name="receipt-outline" size={22} color="#fff" />,
      route: "/rider/delivery/order",
    },
    {
      label: "Earnings",
      icon: <MaterialIcons name="payments" size={22} color="#fff" />,
      route: "/rider-earnings",
    },
    {
      label: "Settings",
      icon: <Ionicons name="settings-outline" size={22} color="#fff" />,
      route: "/rider-settings",
    },
    {
      label: "Verification",
      icon: <Ionicons name="checkmark-done-circle-outline" size={22} color="#fff" />,
      route: "/rider-settings",
    },
    {
      label: "Logout",
      icon: <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />,
      route: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      {/* BACKDROP */}
      {visible && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.backdrop}
        />
      )}

      {/* SIDEBAR */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="small" style={styles.title}>NaGrow - Patner</AppText>
        </View>

        <View style={styles.menuWrap}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, item.danger ? styles.dangerItem : null]}
              onPress={() => {
                onClose();
                navigation?.push(item.route);
              }}
            >
              <View style={styles.icon}>{item.icon}</View>
              <AppText variant="small"
                style={[
                  styles.menuText,
                  item.danger ? { color: "#ff6b6b" } : null,
                ]}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 50,
  },

  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: "#0f172a",
    paddingTop: 55,
    paddingHorizontal: 18,
    zIndex: 100,
    elevation: 20,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    color: "#fff",
    fontSize: 22,
  },

  menuWrap: {
    marginTop: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.4,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  icon: {
    width: 32,
  },

  menuText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
  },

  dangerItem: {
    borderBottomColor: "rgba(255,0,0,0.2)",
  },
});
