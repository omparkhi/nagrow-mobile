import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native"; // 👈 import icons

export default function UserSignup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    if (name === "phone") {
      let onlyDigits = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: onlyDigits });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSignup = async () => {
    const { firstName, lastName, phone, email, password, rePassword } =
      formData;
    if (!firstName || !lastName || !phone || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password !== rePassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      Alert.alert("Success", "User registered successfully!");
    } catch (err) {
      Alert.alert("Error", "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#131222] rounded-b-[50px] pt-20 pb-6">
        <Text className="text-slate-200 font-bold text-4xl text-center">
          Sign Up
        </Text>
        <Text className="text-slate-400 text-lg text-center">
          Please sign up for a new account
        </Text>
      </View>

      {/* Form */}
      <View className="bg-white flex justify-center items-center py-10">
        <View className="w-11/12 max-w-md bg-white text-black rounded-[15px] border border-[#f4f1f7] p-5">
          {/* First + Last Name */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-gray-700 text-left mt-2">First Name</Text>
              <TextInput
                value={formData.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
                placeholder="Enter your first name"
                className="bg-[#f0f5fa] mt-1 px-4 py-3 rounded-lg text-black"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 text-left mt-2">Last Name</Text>
              <TextInput
                value={formData.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
                placeholder="Enter your last name"
                className="bg-[#f0f5fa] mt-1 px-4 py-3 rounded-lg text-black"
              />
            </View>
          </View>

          {/* Phone */}
          <Text className="text-gray-700 text-left mt-4">Phone Number</Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) => handleChange("phone", text)}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Enter your phone number"
            className="bg-[#f0f5fa] mt-1 px-4 py-3 rounded-lg text-black"
          />

          {/* Email */}
          <Text className="text-gray-700 text-left mt-4">Email</Text>
          <TextInput
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
            className="bg-[#f0f5fa] mt-1 px-4 py-3 rounded-lg text-black"
          />

          {/* Password */}
          <Text className="text-gray-700 text-left mt-4">Password</Text>
          <View className="relative mt-1">
            <TextInput
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry={!showPassword}
              placeholder="Enter password"
              className="bg-[#f0f5fa] px-4 py-3 rounded-lg text-black pr-12"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff size={22} color="#666" />
              ) : (
                <Eye size={22} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          {/* Re-enter Password */}
          <Text className="text-gray-700 text-left mt-4">Re-Enter Password</Text>
          <TextInput
            value={formData.rePassword}
            onChangeText={(text) => handleChange("rePassword", text)}
            secureTextEntry={!showPassword}
            placeholder="Re-enter password"
            className="bg-[#f0f5fa] mt-1 px-4 py-3 rounded-lg text-black"
          />

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-md ${
              loading ? "bg-gray-400" : "bg-[#ff5733]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">
                SIGN UP
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <Text className="text-center text-sm mt-5 text-gray-600">
            Already have an account?{" "}
            <Text className="text-[#ff5733] font-semibold">LOG IN</Text>
          </Text>

          {/* OR Divider */}
          <View className="flex-row justify-center items-center my-4">
            <View className="h-px bg-gray-300 w-1/4" />
            <Text className="mx-2 text-gray-500 text-sm">or</Text>
            <View className="h-px bg-gray-300 w-1/4" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row justify-around mt-3">
            <View className="w-10 h-10 rounded-full bg-[#3b5998] items-center justify-center">
              <Text className="text-white text-lg">f</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-[#1da1f2] items-center justify-center">
              <Text className="text-white text-lg">t</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
              <Text className="text-white text-lg">a</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
