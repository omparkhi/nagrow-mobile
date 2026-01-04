import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Animated, Modal, Dimensions } from "react-native";
import { Ionicons, MaterialIcons, Feather, Leaf, UtensilsCrossed } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { VeganIcon } from "lucide-react-native";

const { height } = Dimensions.get("window");

export default function SearchBar ({ onPress, onFilterChange }) {
     const placeholder = ["Cake", "Pizza", "Biryani", "Burger", "Thali"];
      const [index, setIndex] = useState(0);
      const [inputValue, setInputValue] = useState("");
      const [isFocused, setIsFocused] = useState(false);

      const [isVegOnly, setIsVegOnly] = useState(false);
      const [vegMode, setVegMode] = useState("OFF");
      const [showVegModal, setShowVegModal] = useState(false);

      const animatedY = new Animated.Value(0);
    
    useEffect(() => {
      // If user is typing or focused, stop animation safely
      if (inputValue || isFocused) {
        return () => {}; // no interval → no cleanup needed
      }
    
      const interval = setInterval(() => {
        if (index === placeholder.length - 1) {
          // Animate last item
          Animated.timing(animatedY, {
            toValue: -index * 24,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => {
              animatedY.setValue(0); 
              setIndex(0);
            }, 200);
          });
        } else {
          // Normal forward animation
          Animated.timing(animatedY, {
            toValue: -(index + 1) * 24,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setIndex(prev => prev + 1);
          });
        }
      }, 2000);
    
      return () => clearInterval(interval);
    }, [index, inputValue, isFocused]);

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
        {/* Search + Veg Filter */}
            <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <Feather name="search" size={20} color="#ff5733" />

                  {/* <View style={{ flex: 1 }} pointerEvents="none"> */}
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
                    <View style={styles.placeholderRow}>
                      <AppText  style={{ fontSize: 17 , fontFamily: "Nunito", color: "#555" }}>
                        Search for{" "}
                      </AppText>
                      <View style={{ height: 24, overflow: "hidden" }}>
                        <Animated.View
                          style={{
                            transform: [{ translateY: animatedY }],
                          }}
                        >
                          {placeholder.map((word, i) => (
                            <AppText
                              key={i}
                              // variant="body"
                              style={{fontSize: 17, fontFamily: "Nunito", height: 24, color: "#555" }}
                            >
                              {word}
                            </AppText>
                          ))}
                        </Animated.View>
                      </View>
                    </View>
                  )}
                  {/* </View> */}
        
                  <MaterialIcons name="mic" size={24} color="#ff5733" />
                </View>
        
                {/* Veg Toggle */}
                <View style={styles.vegBox}>
                  <AppText  weight="bold" style={{ fontSize: 17, color: vegMode !== "OFF" ? "#00ac22" : "#444" }}>
                    VEG
                  </AppText>
        
                  <TouchableOpacity
                    // onPress={() => setIsVegOnly(!isVegOnly)}
                    onPress={handleTogglePress}
                    style={[styles.toggle, vegMode !== "OFF" && styles.toggleActive]}
                  >
                    <Animated.View
                      style={[
                        styles.toggleCircle,
                        vegMode !== "OFF" ? { transform: [{ translateX: 21 }] } : {},
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {/* Veg selection modal */}
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
                      {/* Leaf Icon (use your preferred icon lib) */}
                      <Feather name="feather" size={24} color="#00ac22" />
                      {/* <VeganIcon size={24} color="#00ac22" />  */}
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
    )
}


const styles = StyleSheet.create({

  searchContainer: {
    marginTop: 5,
    flexDirection: "row",
    paddingHorizontal: 12,
  },

  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    
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
  },

  vegBox: {
    backgroundColor: "#fff",
    marginLeft: 8,
    paddingHorizontal: 5,
    // paddingVertical: 1,
    borderRadius: 8,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  toggle: {
    width: 37,
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 6,
    // marginTop: 1,
    marginTop: -4,
    padding: 2,
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: "#1fa71f",
  },

  toggleCircle: {
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    paddingHorizontal: 10 // Bottom sheet style
    // justifyContent: "center" // Or Center style
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
