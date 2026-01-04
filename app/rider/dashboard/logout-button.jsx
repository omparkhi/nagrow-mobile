import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/rider/authSlice";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    // router.replace("/rider-login");
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
