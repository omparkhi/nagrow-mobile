import React from "react";
import {
  View,
  Text,
  ImageBackground,
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
import { TouchableOpacity } from "@/app/TouchableOpacity";


const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();

  const roles = [
    {
      title: "Customer",
      description: "Order delicious food from local restaurants.",
      animation: customer,
      link: "/user-signup",
    },
    {
      title: "Restaurant",
      description: "Partner with NaGrow to reach more customers.",
      animation: restaurant,
      link: "/restaurant-signup",
    },
    {
      title: "Delivery Partner",
      description: "Earn by delivering orders around your city.",
      animation: delivery,
      link: "/rider-signup",
    },
  ];

  return (
    <>
      {/* Background */}
      <ImageBackground
        source={rootBg}
        style={{ position: "absolute", width: "100%", height: "150%",  }}
        resizeMode="cover"
        blurRadius={2}
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
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                  borderRadius: 18,
                  padding: 10,
                  alignItems: "center",
                  boxShadow: "0px 4px 6px rgba(0,0,0,0.3)",

                  // elevation: 5, // Android shadow
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
                    color: "#3b3a3aff", // slate-700
                    textAlign: "center",
                  }}
                >
                  {role.description}
                </AppText>
                <TouchableOpacity
                  onPress={() => router.push(role.link)}
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
    </>
  );
}
