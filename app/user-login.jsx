import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
// import { loginUser } from "@/redux/slices/user/loginSlice";
import { loginUser } from "@/redux/slices/user/authSlice";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";

export default function UserLogin() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (key, value) => {
    if (key === "phone") value = value.replace(/\D/g, "");
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const res = await dispatch(loginUser(formData));

    if (res.meta.requestStatus === "fulfilled") {
      router.push("/user/dashboard/dash");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* LOADING OVERLAY */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ff5733" />
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Log In
        </AppText>
        <AppText variant="light" style={styles.headerSubtitle}>
          Please sign in to your existing account
        </AppText>
      </View>

      {/* FORM */}
      <View style={styles.form}>

        {/* PHONE INPUT */}
        <AppText style={styles.label}>Phone Number</AppText>
        <View style={styles.phoneRow}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>

          <TextInput
            value={formData.phone}
            onChangeText={(v) => handleChange("phone", v)}
            maxLength={10}
            keyboardType="numeric"
            placeholder="Enter your phone number"
            style={styles.phoneInput}
          />
        </View>

        {/* PASSWORD */}
        <AppText style={styles.label}>Password</AppText>
        <View style={styles.passwordWrapper}>
          <TextInput
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            placeholder="Password"
            style={styles.passwordInput}
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
        {error && <Text style={styles.error}>{error}</Text>}

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>LOG IN</Text>
        </TouchableOpacity>

        {/* SIGNUP LINK */}
        <TouchableOpacity onPress={() => router.push("/user-signup")}>
          <Text style={styles.signupText}>
            Don’t have an account?{" "}
            <Text style={styles.signupLink}>SIGN UP</Text>
          </Text>
        </TouchableOpacity>

        {/* OR DIVIDER */}
        <View style={styles.orSection}>
          <Text style={styles.orText}>or</Text>
        </View>

        {/* SOCIAL BUTTONS */}
        <View style={styles.socialRow}>
          <View style={[styles.socialBtn, { backgroundColor: "#3b5998" }]}>
            <Text style={styles.socialText}>f</Text>
          </View>
          <View style={[styles.socialBtn, { backgroundColor: "#1da1f2" }]}>
            <Text style={styles.socialText}>t</Text>
          </View>
          <View style={[styles.socialBtn, { backgroundColor: "#000" }]}>
            <Text style={styles.socialText}>a</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  loaderOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(113,113,113,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
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
    color: "#595959",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  countryCodeBox: {
    width: "18%",
    backgroundColor: "#f0f5fa",
    paddingVertical: 14,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#d6d6d6",
  },

  countryCodeText: {
    color: "#555",
    fontSize: 16,
  },

  phoneInput: {
    width: "82%",
    backgroundColor: "#f0f5fa",
    padding: 14,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
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
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 10,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  signupText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 13,
    color: "#444",
  },

  signupLink: {
    color: "#ff5733",
  },

  orSection: {
    alignItems: "center",
    marginVertical: 15,
  },

  orText: {
    fontSize: 13,
    color: "#666",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  socialBtn: {
    width: 45,
    height: 45,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  socialText: {
    color: "#fff",
    fontSize: 18,
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 8,
  },
});
