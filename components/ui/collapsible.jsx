import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

export function Collapsible({ children, title }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        {/* Replace with your icon component or remove */}
        <Text style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}>
          ▶
        </Text>

        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>

      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
