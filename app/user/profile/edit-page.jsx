import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUser } from "@/redux/slices/user/authSlice";


export default function EditProfilePage () {
    const router = useRouter();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone ? String(user.phone) : "",
    });

    const [loading, setLoading] = useState(false);

    // Track which field is currently being edited (for UI focus effects)
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleUpdate = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/user/edit-profile`, formData, config);
            console.log(res.data.success)

            if (res.data.success) {
                dispatch(updateUser({ ...user, ...formData }));
                Alert.alert("Success", "Profile updated successfully");
                router.back();
            }
        } catch (error) {
            console.log("Update Error", error);
            Alert.alert("Error", error.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };
    
    const renderInput = (label, field, keyboardType = "default", icon) => (
        <View style={styles.inputGroup}>
        <AppText style={styles.label}>{label}</AppText>
        <View style={[
            styles.inputContainer, 
            focusedField === field && styles.inputFocused
        ]}>
            <Ionicons name={icon} size={20} color="#64748b" style={{ marginRight: 10 }} />
            <TextInput
            style={styles.input}
            value={formData[field]}
            onChangeText={(text) => handleChange(field, text)}
            placeholder={`Enter ${label}`}
            keyboardType={keyboardType}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            />
            {/* Pencil Icon to indicate editability */}
            <Ionicons name="pencil" size={16} color="#fd731d" />
        </View>
        </View>
    );

    return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <AppText variant="medium" style={{ marginLeft: 15 }}>Edit Profile</AppText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {renderInput("First Name", "firstName", "default", "person-outline")}
        {renderInput("Last Name", "lastName", "default", "person-outline")}
        {renderInput("Email Address", "email", "email-address", "mail-outline")}
        {renderInput("Phone Number", "phone", "phone-pad", "call-outline")}

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.saveBtnText}>Update Profile</AppText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40, // Adjust for status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "#f8fafc"
  },
  inputFocused: {
    borderColor: "#fd731d", // Active Color
    backgroundColor: "#fff"
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    fontFamily: "Nunito-Regular" // Assuming you use this font
  },
  saveBtn: {
    backgroundColor: "#fd731d",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#fd731d",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});