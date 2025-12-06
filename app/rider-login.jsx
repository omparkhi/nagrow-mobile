import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginRider } from "@/redux/slices/rider/authSlice";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";

export default function RiderLogin() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error } = useSelector((state) => state.riderAuth);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (key, value) => {
    if (key === "phone") {
      value = value.replace(/\D/g, "");
    }
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!formData.phone || !formData.password) {
      Alert.alert("All fields are required");
      return;
    }

    const res = await dispatch(loginRider(formData));
    // console.log(res)

    if (res.meta.requestStatus === "fulfilled") {
      Alert.alert("Login Success");
      router.push("/rider/dashboard/dash");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Loader */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ff5733" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Rider Login
        </AppText>
        <AppText variant="light" style={styles.headerSubtitle}>
          Welcome back! Please log in
        </AppText>
      </View>

      <View style={styles.form}>
        {/* PHONE */}
        <AppText variant="small" style={styles.label}>Phone Number</AppText>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(v) => handleChange("phone", v)}
          keyboardType="numeric"
          maxLength={10}
          placeholder="Enter your phone number"
        />

        {/* PASSWORD */}
        <AppText variant="small" style={styles.label}>Password</AppText>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            placeholder="Enter your password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* ERROR */}
        {error && <Text style={styles.error}>{String(error)}</Text>}

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>LOGIN</Text>
        </TouchableOpacity>

        {/* SIGNUP NAV */}
        <TouchableOpacity onPress={() => router.push("/rider/signup")}>
          <Text style={styles.loginText}>
            Don’t have an account? <Text style={styles.loginLink}>SIGN UP</Text>
          </Text>
        </TouchableOpacity>
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

  headerTitle: {
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 20,
    color: "#bdbdc7",
    marginTop: 5,
  },

  form: {
    padding: 20,
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    color: "#595959ff",
  },

  input: {
    backgroundColor: "#f0f5fa",
    padding: 14,
    borderRadius: 10,
    fontFamily: "Nunito-Light",
    fontSize: 15,
  },

  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    backgroundColor: "#f0f5fa",
    padding: 14,
    borderRadius: 10,
    paddingRight: 40,
  },

  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "35%",
  },

  submitBtn: {
    backgroundColor: "#ff5733",
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  loginText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 13,
    color: "#444",
  },
  loginLink: {
    color: "#ff5733",
  },

  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
