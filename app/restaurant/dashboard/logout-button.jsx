import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/restaurant/authSlice";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { Play } from "lucide-react-native";
import { playNewOrderSound } from "@/hooks/rest-sound-notification";
import { useToast } from "@/app/ToastContext";

export default function LogoutButton() {
  // const { showToast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/restaurant-login");
    // playNewOrderSound();
    // showToast(`NAGROW-12543573`, "Your Order is placed succesfully");
    
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        backgroundColor: "red",
        padding: 12,
        borderRadius: 10,
        marginTop: 16,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
        Logout
      </Text>
    </TouchableOpacity>
  );
}
