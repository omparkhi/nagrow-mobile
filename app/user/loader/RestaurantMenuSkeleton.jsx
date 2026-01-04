import React from "react";
import { View, ScrollView } from "react-native";
import Skeleton from "./skeleton";

export default function RestaurantMenuSkeleton() {
  return (
    <ScrollView>
      {/* HEADER */}
      <View style={{ backgroundColor: "#131222", padding: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 22, padding: 16 }}>
          <Skeleton width={120} height={16} />
          <View style={{ marginTop: 12 }}>
            <Skeleton width={220} height={26} />
          </View>
          <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
            <Skeleton width={80} height={14} />
            <Skeleton width={120} height={14} />
          </View>
        </View>
      </View>

      {/* MENU */}
      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        {[1, 2, 3].map(section => (
          <View key={section} style={{ marginBottom: 30 }}>
            <Skeleton width={140} height={20} style={{ marginBottom: 15 }} />

            {[1, 2, 3].map(item => (
              <View
                key={item}
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                }}
              >
                <Skeleton width={90} height={90} />

                <View style={{ marginLeft: 15, flex: 1 }}>
                  <Skeleton width={180} height={18} />
                  <View style={{ marginTop: 6 }}>
                    <Skeleton width={80} height={14} />
                  </View>
                  <View style={{ marginTop: 6 }}>
                    <Skeleton width={220} height={12} />
                  </View>
                </View>

                <Skeleton width={60} height={30} style={{ borderRadius: 6 }} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
