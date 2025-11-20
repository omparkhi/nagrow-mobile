import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

import customer from "@/assets/customer.json";
import restaurant from "@/assets/restaurant.json";
import delivery from "@/assets/delivery2.json";
import rootBg from "@/assets/rootBg.jpeg";
import AppText from "@/components/AppText";

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();

  const roles = [
    {
      title: "Customer",
      description: "Order delicious food from local restaurants.",
      animation: customer,
      link: "/customer-options",
    },
    {
      title: "Restaurant",
      description: "Partner with NaGrow to reach more customers.",
      animation: restaurant,
      link: "/restaurant-login",
    },
    {
      title: "Delivery Partner",
      description: "Earn by delivering orders around your city.",
      animation: delivery,
      link: "/rider-login",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      {/* Background */}
      <ImageBackground
        source={rootBg}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
        blurRadius={8}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <View className="relative z-10 items-center mt-4">
          {/* Title */}
          <AppText
          variant="h1"
            style={{

              fontSize: 56, // match web md:text-7xl
              // fontWeight: "bold",
              color: "#ff5733",
              textAlign: "center",
              marginTop: 20
            }}
          >
            NaGrow
          </AppText>
          <AppText
          variant="caption"
            style={{ 
              color: "white",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Nagpur’s First Hyperlocal Food Delivery Revolution
          </AppText>

          {/* Roles */}
          <View
            style={{
              marginTop: 32,
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {roles.map((role, index) => (
              <View
                key={index}
                style={{
                  width: width * 0.9,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  borderRadius: 18,
                  padding: 10,
                  alignItems: "center",
                  // boxShadow: "0px 4px 6px rgba(0,0,0,0.3)",

                  elevation: 5, // Android shadow
                  marginBottom: 16,
                }}
              >
                <LottieView
                  source={role.animation}
                  autoPlay
                  loop
                  style={{ width: 240, height: 240 }}
                />
                <AppText
                variant="heading"
                  style={{
                    // fontSize: 24,
                    marginVertical: 8,
                    textAlign: "center",
                  }}
                >
                  {role.title}
                </AppText>
                <AppText
                variant="small"
                  style={{
                    fontSize: 18,
                    color: "#504f4fff", // slate-700
                    textAlign: "center",
                  }}
                >
                  {role.description}
                </AppText>
                <TouchableOpacity
                  onPress={() => router.push("/map/MapPicker")}
                  style={{
                    marginTop: 20,
                    paddingVertical: 7,
                    paddingHorizontal: 24,
                    borderRadius: 13,
                    backgroundColor: "#ff5733",
                  }}
                >
                  <AppText
                    style={{
                      color: "white",
                      fontSize: 20,
                      textAlign: "center",
                    }}
                  >
                    Go
                  </AppText>
                  {/* <AppText variant="label">Hello</AppText> */}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
