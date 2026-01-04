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
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { signupRes } from "@/redux/slices/restaurant/authSlice"; // your slice

export default function RestaurantSignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.restaurantAuth);

  const [accessing, setAccessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ownername: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      fullAddress: "",
      location: { type: "Point", coordinates: [0, 0] },
    },
    cuisine: "",
    deliveryTimeEstimate: "",
  });

  const handleChange = (key, value) => {
    if (["street", "city", "state", "pincode"].includes(key)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (key === "phone") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, phone: onlyDigits }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleGeolocation = async () => {
    setAccessing(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Enable location to continue.");
      setAccessing(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = reverseGeocode[0];

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          street: address.street || "",
          city: address.city || "",
          state: address.region || "",
          pincode: address.postalCode || "",
          fullAddress: `${address.name || ""} ${address.street || ""}, ${address.city || ""}, ${address.region || ""}, ${address.postalCode || ""}`,
          location: { type: "Point", coordinates: [longitude, latitude] },
        },
      }));
      Alert.alert("Location saved", "Your restaurant location has been picked!");
    } catch (err) {
      console.error("Location Error:", err);
      Alert.alert("Error", "Failed to access location");
    } finally {
      setAccessing(false);
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const payload = {
      ...formData,
      cuisine: formData.cuisine.split(",").map((c) => c.trim()),
    };
    delete payload.confirmPassword;

    try {
      const res = await dispatch(signupRes(payload));
      if (res.meta.requestStatus === "fulfilled") {
        router.push("/restaurant/dashboard/dash");
      } else {
        Alert.alert("Error", res.payload || "Signup failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      Alert.alert("Error", "Something went wrong during signup");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {(accessing || loading) && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ff5733" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" style={styles.headerTitle}>
          Restaurant Sign Up
        </AppText>
        <AppText variant="light" style={styles.headerSubtitle}>
          Please sign up for a new account
        </AppText>
      </View>

      <View style={styles.form}>
        <AppText variant="small" style={styles.label}>Restaurant Name</AppText>
        <TextInput style={styles.input} value={formData.name} onChangeText={(v) => handleChange("name", v)} placeholder="Enter restaurant name" />

        <AppText variant="small" style={styles.label}>Owner Name</AppText>
        <TextInput style={styles.input} value={formData.ownername} onChangeText={(v) => handleChange("ownername", v)} placeholder="Enter owner name" />

        <AppText variant="small" style={styles.label}>Phone Number</AppText>
        <TextInput style={styles.input} value={formData.phone} onChangeText={(v) => handleChange("phone", v)} maxLength={10} keyboardType="numeric" placeholder="Enter phone number" />

        <AppText variant="small" style={styles.label}>Email</AppText>
        <TextInput style={styles.input} value={formData.email} onChangeText={(v) => handleChange("email", v)} keyboardType="email-address" placeholder="Enter email" />

        <AppText variant="small" style={styles.label}>Password</AppText>
        <View style={styles.passwordWrapper}>
          <TextInput style={styles.passwordInput} secureTextEntry={!showPassword} value={formData.password} onChangeText={(v) => handleChange("password", v)} placeholder="Password" />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <AppText variant="small" style={styles.label}>Confirm Password</AppText>
        <View style={styles.passwordWrapper}>
          <TextInput style={styles.passwordInput} secureTextEntry={!showPassword} value={formData.confirmPassword} onChangeText={(v) => handleChange("confirmPassword", v)} placeholder="Confirm Password" />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locationBtn} onPress={handleGeolocation}>
          <AppText style={styles.btnText}>Pick Location Automatically</AppText>
        </TouchableOpacity>
        {formData.address.fullAddress && <AppText style={{ marginVertical: 5 }}>{formData.address.fullAddress}</AppText>}

        <AppText variant="small" style={styles.label}>Cuisine Type</AppText>
        <TextInput style={styles.input} value={formData.cuisine} onChangeText={(v) => handleChange("cuisine", v)} placeholder="e.g., Indian, Chinese" />

        <AppText variant="small" style={styles.label}>Delivery Time Estimate</AppText>
        <TextInput style={styles.input} value={formData.deliveryTimeEstimate} onChangeText={(v) => handleChange("deliveryTimeEstimate", v)} placeholder="e.g., 30-45 mins" />

            {/* LOGIN LINK */}
        <TouchableOpacity onPress={() => router.push("/restaurant-login")}>
            <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>LOG IN</Text>
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <AppText style={styles.btnText}>SIGN UP</AppText>
        </TouchableOpacity>

        

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderOverlay: { position: "absolute", zIndex: 999, width: "100%", height: "100%", backgroundColor: "rgba(113,113,113,0.5)", justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#131222", paddingTop: 70, paddingBottom: 40, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, alignItems: "center" },
  headerTitle: { color: "#fff" },
  headerSubtitle: { fontSize: 20, color: "#bdbdc7", marginTop: 5 },
  form: { padding: 20 },
  label: { marginTop: 10, marginBottom: 5, color: "#595959ff" },
  input: { backgroundColor: "#f0f5fa", padding: 14, borderRadius: 10, fontSize: 15 },
  passwordWrapper: { position: "relative" },
  passwordInput: { backgroundColor: "#f0f5fa", padding: 14, borderRadius: 10, paddingRight: 40 },
  eyeIcon: { position: "absolute", right: 12, top: "35%" },
  locationBtn: { backgroundColor: "#4287f5", padding: 14, borderRadius: 10, marginVertical: 10, alignItems: "center" },
  submitBtn: { backgroundColor: "#ff5733", marginTop: 30, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  error: { color: "red", marginTop: 10, textAlign: "center" },
  loginLink: {
    color: "#ff5733",
    
    // fontWeight: "700",
  },
});
