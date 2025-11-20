import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet, Animated } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import AppText from "@/components/AppText";

export default function SearchBar () {
     const placeholder = ["Cake", "Pizza", "Biryani", "Burger", "Thali"];
      const [index, setIndex] = useState(0);
      const [inputValue, setInputValue] = useState("");
      const [isFocused, setIsFocused] = useState(false);
      const [isVegOnly, setIsVegOnly] = useState(false);
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
            useNativeDriver: false,
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
    
    
    return (
        <>
        {/* Search + Veg Filter */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <Feather name="search" size={20} color="#ff5733" />
        
                  <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder=""
                    style={styles.input}
                  />
        
                  {/* Animated Placeholder */}
                  {!inputValue && !isFocused && (
                    <View style={styles.placeholderRow}>
                      <AppText  style={{ fontSize: 17 , color: "#555" }}>
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
                              style={{fontSize: 17, height: 24, color: "#555", fontWeight: "600" }}
                            >
                              {word}
                            </AppText>
                          ))}
                        </Animated.View>
                      </View>
                    </View>
                  )}
        
                  <MaterialIcons name="mic" size={24} color="#ff5733" />
                </View>
        
                {/* Veg Toggle */}
                <View style={styles.vegBox}>
                  <AppText  weight="bold" style={{ fontSize: 17, color: "#444" }}>
                    VEG
                  </AppText>
        
                  <TouchableOpacity
                    onPress={() => setIsVegOnly(!isVegOnly)}
                    style={[styles.toggle, isVegOnly && styles.toggleActive]}
                  >
                    <Animated.View
                      style={[
                        styles.toggleCircle,
                        isVegOnly ? { transform: [{ translateX: 21 }] } : {},
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
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
    borderRadius: 12,
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
    borderRadius: 10,
  },
});
