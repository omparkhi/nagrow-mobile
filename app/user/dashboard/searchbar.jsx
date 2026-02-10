import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Animated, Modal, Dimensions, Easing } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function SearchBar({ onPress, onFilterChange }) {
  // 1. Define list + Duplicate the first item at the end for infinite loop effect
  const originalWords = ["Cake", "Pizza", "Biryani", "Burger", "Thali"];
  const placeholder = [...originalWords, originalWords[0]]; 
  
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [vegMode, setVegMode] = useState("OFF");
  const [showVegModal, setShowVegModal] = useState(false);

  // 2. Use a Ref for the animation value (prevents re-renders)
  const animatedY = useRef(new Animated.Value(0)).current;
  const ITEM_HEIGHT = 24; // Must match your View height exactly

  useEffect(() => {
    // Stop if user is typing
    if (inputValue || isFocused) return;

    let currentStep = 0;
    let shouldContinue = true;

    const runAnimation = () => {
      if (!shouldContinue) return;

      // A. Wait 2 seconds (Visible time)
      setTimeout(() => {
        if (!shouldContinue) return;

        // B. Animate to next item
        currentStep += 1;
        
        Animated.timing(animatedY, {
          toValue: -currentStep * ITEM_HEIGHT,
          duration: 500, // Smooth transition speed
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }).start(() => {
          // C. Animation Finished
          if (currentStep === placeholder.length - 1) {
             // D. If we reached the "Clone" at the bottom, SNAP back to top instantly
             currentStep = 0;
             animatedY.setValue(0);
          }
          // E. Loop
          runAnimation();
        });
      }, 2000); 
    };

    // Start the loop
    runAnimation();

    // Cleanup function to kill the loop if component unmounts/focus changes
    return () => {
      shouldContinue = false;
      animatedY.setValue(0); // Reset position
    };
  }, [isFocused, inputValue]); // Only restart if focus/input changes

  // ... rest of your filter logic ...
  const handleTogglePress = () => {
    if (vegMode !== "OFF") {
      setVegMode("OFF");
      onFilterChange("OFF");
    } else {
      setShowVegModal(true);
    }
  };

  const handleSelectMode = (mode) => {
    setVegMode(mode);
    onFilterChange(mode);
    setShowVegModal(false);
  }

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Feather name="search" size={20} color="#00965a" />

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              editable={false}
              placeholder=""
              style={styles.input}
            />

            {/* Animated Placeholder */}
            {!inputValue && !isFocused && (
              <View style={styles.placeholderRow} pointerEvents="none">
                <AppText style={{ fontSize: 17, fontFamily: "Nunito", color: "#555" }}>
                  Search for{" "}
                </AppText>
                
                {/* Fixed Height Container */}
                <View style={{ height: ITEM_HEIGHT, overflow: "hidden" }}>
                  <Animated.View
                    style={{
                      transform: [{ translateY: animatedY }],
                    }}
                  >
                    {placeholder.map((word, i) => (
                      <AppText
                        key={i}
                        style={{
                          fontSize: 17,
                          fontFamily: "Nunito",
                          height: ITEM_HEIGHT, // Height matched
                          lineHeight: ITEM_HEIGHT, // Center vertically
                          color: "#555",
                        }}
                      >
                        {word}
                      </AppText>
                    ))}
                  </Animated.View>
                </View>
              </View>
            )}

            <MaterialIcons name="mic" size={24} color="#00965a" />
          </View>

          {/* Veg Toggle */}
          <View style={styles.vegBox}>
            <AppText style={{ fontSize: 18, color: "#3c3c3cff", fontFamily: "Gravitas" }}>
              VEG
            </AppText>

            <TouchableOpacity
              onPress={handleTogglePress}
              style={[styles.toggle, vegMode !== "OFF" && styles.toggleActive]}
            >
              <Animated.View
                style={[
                  styles.toggleCircle,
                  vegMode !== "OFF" ? { transform: [{ translateX: 10 }] } : {},
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* ... Your Modal Code (unchanged) ... */}
       <Modal
          visible={showVegModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowVegModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowVegModal(false)}
          >
            <View style={styles.modalContent}>
              <AppText style={styles.modalTitle}>Choose Veg Preference</AppText>

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => handleSelectMode("PURE_VEG")}
              >
                <View style={[styles.iconBox, { backgroundColor: "#e6f4ea" }]}>
                  <Feather name="feather" size={24} color="#00ac22" />
                </View>
                <View style={{flex: 1}}>
                  <AppText style={styles.optionTitle}>Pure Veg Restaurants</AppText>
                  <AppText variant="light" style={styles.optionSub}>Show only 100% vegetarian places</AppText>
                </View>

                <View style={[styles.radioOuter, vegMode === "PURE_VEG" && styles.radioOuterActive]}>
                  {vegMode === "PURE_VEG" && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.optionBtn} 
                onPress={() => handleSelectMode("VEG_ALL")}
              >
                <View style={[styles.iconBox, { backgroundColor: "#fff3e0" }]}>
                  <MaterialIcons name="restaurant-menu" size={24} color="#ff9800" />
                </View>
                <View style={{flex: 1}}>
                  <AppText style={styles.optionTitle}>Veg Dishes (All)</AppText>
                  <AppText variant="light" style={styles.optionSub}>Show veg options from all restaurants</AppText>
                </View>

                <View style={[styles.radioOuter, vegMode === "VEG_ALL" && styles.radioOuterActive]}>
                  {vegMode === "VEG_ALL" && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
    </>
  );
}

// ... styles (unchanged) ...
const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 5,
    flexDirection: "row",
    paddingHorizontal: 12,
    zIndex: 999999
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    height: 53,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },
  placeholderRow: {
    position: "absolute",
    left: 38,
    flexDirection: "row",
    alignItems: 'center', // Align "Search for" and animated text
  },
  vegBox: {
    marginLeft: 8,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  toggle: {
    width: 28,
    height: 12,
    backgroundColor: "#909090ff",
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    width: 28,
    height: 12,
    backgroundColor: "#1fa71f",
  },
  toggleCircle: {
    width: 18,
    height: 18,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#d4d4d4ff",
    marginLeft: -5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    paddingHorizontal: 10 
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 10,
    paddingBottom: 40
  },
  modalTitle: { fontSize: 20, marginBottom: 10, color: "#333" },
  optionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  iconBox: { width: 45, height: 45, borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 15 },
  optionTitle: { fontSize: 19, color: "#333", lineHeight: 20 },
  optionSub: { fontSize: 12, color: "#888" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 5 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#16a34a",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16a34a",
  },
});