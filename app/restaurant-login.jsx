import React, { useState } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { loginRes } from "@/redux/slices/restaurant/authSlice";

export default function RestaurantLogin() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error } = useSelector((state) => state.restaurantAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

 

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };


  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      const res = await dispatch(loginRes(formData));
    //   console.log("API Response:", res);
    //   console.log("POST URL:", `${}/api/restaurants/login`);


      if (res.meta.requestStatus === "fulfilled") {
        router.push("/restaurant/dashboard/dash");
        // Alert.alert("Login successfull")
      } else {
        Alert.alert("Login failed", res.payload || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ff5733" />
        </View>
      )}

      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Restaurant Log In
        </AppText>
        <AppText variant="light" style={styles.headerSubtitle}>
          Please sign in to your account
        </AppText>
      </View>

      <View style={styles.form}>
        <AppText variant="small" style={styles.label}>
          Email
        </AppText>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
          placeholder="Enter your email"
        />

        <AppText variant="small" style={styles.label}>
          Password
        </AppText>
        <View style={styles.passwordWrapper}>
          <TextInput
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            secureTextEntry={!showPassword}
            placeholder="Password"
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <AppText style={styles.btnText}>LOG IN</AppText>
        </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/home")}>
                   
                    <Text>SIGN UP</Text>
     
                </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderOverlay: {
    position: "absolute",
    zIndex: 999,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(113,113,113,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#131222",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: "center",
  },
  headerTitle: { color: "#fff" },
  headerSubtitle: { fontSize: 20, color: "#bdbdc7", marginTop: 5 },
  form: { padding: 20 },
  label: { marginTop: 10, marginBottom: 5, color: "#595959ff" },
  input: { backgroundColor: "#f0f5fa", padding: 14, borderRadius: 10, fontSize: 15 },
  passwordWrapper: { position: "relative" },
  passwordInput: {
    backgroundColor: "#f0f5fa",
    padding: 14,
    borderRadius: 10,
    paddingRight: 40,
  },
  eyeIcon: { position: "absolute", right: 12, top: "35%" },
  submitBtn: {
    backgroundColor: "#ff5733",
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  error: { color: "red", marginTop: 10, textAlign: "center" },
});
