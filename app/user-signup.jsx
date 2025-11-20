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
import { useDispatch, useSelector } from "react-redux";
// import { signupUser } from "@/redux/slices/user/signupSlice";
import { signupUser } from "@/redux/slices/user/authSlice";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";


export default function UserSignup() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (key, value) => {
    if (key === "phone") {
      value = value.replace(/\D/g, "");
    }
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const res = await dispatch(signupUser(formData));
    console.log("signup user", res);
    if (res.meta.requestStatus === "fulfilled") {
      router.push("/user/save-location");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ff5733" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Sign Up
        </AppText>
        <AppText variant="light" style={styles.headerSubtitle}>
          Please sign up for a new account
        </AppText>
      </View>

      <View style={styles.form}>
        {/* FIRST NAME */}
        <AppText variant="small" style={styles.label}>First Name</AppText>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={(v) => handleChange("firstName", v)}
          placeholder="Enter your first name"
        />

        {/* LAST NAME */}
        <AppText variant="small" style={styles.label}>Last Name</AppText>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={(v) => handleChange("lastName", v)}
          placeholder="Enter your last name"
        />

        {/* PHONE */}
        <AppText variant="small" style={styles.label}>Phone Number</AppText>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(v) => handleChange("phone", v)}
          maxLength={10}
          keyboardType="numeric"
          placeholder="Enter your phone number"
        />

        {/* EMAIL */}
        <AppText variant="small" style={styles.label}>Email</AppText>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        {/* PASSWORD */}
        <AppText variant="small" style={styles.label}>Password</AppText>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            placeholder="Password"
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

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>SIGN UP</Text>
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <TouchableOpacity onPress={() => router.push("/user-login")}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>LOG IN</Text>
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
    // fontSize: 34,
    color: "#fff",
    // fontWeight: "700",
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
    // fontWeight: "600",
  },
  input: {
    backgroundColor: "#f0f5fa",
    padding: 14,
    borderRadius: 10,
    fontFamily: "Nunito-Light",
    fontSize: 15

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
    // fontWeight: "700",
  },

  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
