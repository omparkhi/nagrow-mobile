import React, { useState, useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions, Text } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Home, List, ClipboardList, BarChart2, Image, Settings, LogOut } from "lucide-react-native";
import { useSelector } from "react-redux";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = 260;

export default function Header() {
   
  const { restaurant, loading, error } = useSelector(state => state.restaurantAuth);
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  const handleLogout = () => {
    console.log("logout clicked");
    // implement logout logic here
  };

  const navigate = (screen) => {
    router.push(screen); // change to router.push or navigation if using react-navigation
  };

  return (
    <>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => setIsOpen(true)} style={{ marginRight: 10 }}>
              <AppText style={{ fontSize: 22, color: "white" }}>☰</AppText>
            </TouchableOpacity>

            <AppText style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
              {restaurant?.name || "Restaurant"}
            </AppText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialIcons name="account-circle" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: -15, marginLeft: 28 }}>
          <AppText style={{ fontSize: 12, color: "#959595ff" }}>
            {restaurant?.address?.street || ""}
          </AppText>
        </View>
      </View>

      {/* Sidebar */}
      {isOpen && <TouchableOpacity style={styles.overlay} onPress={() => setIsOpen(false)} activeOpacity={1} />}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <AppText style={styles.title}>NaGrow</AppText>
          <TouchableOpacity onPress={() => setIsOpen(false)}>
            <AppText style={styles.closeBtn}>✕</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <MenuItem icon={<Home size={20} color="#fff" />} label="Dashboard" onPress={() => navigate("/restaurant/dashboard/dash")} />
          <MenuItem icon={<List size={20} color="#fff" />} label="Menu Items" onPress={() => navigate("/restaurant/menu")} />
          <MenuItem icon={<ClipboardList size={20} color="#fff" />} label="Orders" onPress={() => router.push("/restaurant/order/get-order")} />
          <MenuItem icon={<BarChart2 size={20} color="#fff" />} label="Analytics" onPress={() => navigate("/restaurant/analytics")} />
          <MenuItem icon={<Image size={20} color="#fff" />} label="Media" onPress={() => navigate("/restaurant/media")} />
          <MenuItem icon={<ClipboardList size={20} color="#fff" />} label="Verification" onPress={() => navigate("/restaurant/verify")} />
          <MenuItem icon={<Settings size={20} color="#fff" />} label="Settings" onPress={() => navigate("/restaurant/settings")} />
          <MenuItem icon={<LogOut size={20} color="#fff" />} label="Logout" onPress={handleLogout} />
        </View>
      </Animated.View>
    </>
  );
}

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {icon}
    <AppText style={styles.menuText}>{label}</AppText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#00000080",
    zIndex: 10,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#111827",
    padding: 20,
    zIndex: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: { fontSize: 22, color: "#fff" },
  closeBtn: { fontSize: 22, color: "#fff" },
  menuContainer: { marginTop: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuText: { color: "#fff", fontSize: 15, marginLeft: 12 },
});
