import React from "react";
import { View, ScrollView, Image, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import CategoryItem from "./categoryItem";
import { TouchableOpacity } from "../../TouchableOpacity"; // Your custom touchable
import { Check } from "lucide-react-native";

// 1. Accept props
const Category = ({ selectedCategory, onSelectCategory }) => {  
  
  return (
    <View style={styles.container}>
      <AppText variant="small" style={styles.title}>What's in your mind?</AppText>

      <View style={styles.row}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CategoryItem.map((item) => {
            
            // 2. Determine if THIS item is selected
            const isSelected = selectedCategory === item.searchKey;

            return (
              <View key={item.id} style={styles.item}>
                <TouchableOpacity 
                  onPress={() => onSelectCategory(item?.searchKey || null)}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageContainer}>
                    
                    {/* Image with Conditional Border */}
                    <Image 
                      source={item.image} 
                      style={[
                        styles.image, 
                        // If selected, use Orange border. If not, transparent or grey
                        isSelected ? { borderColor: "#ff7606ff", borderWidth: 2 } : { borderColor: "transparent", borderWidth: 0 }
                      ]} 
                    />

                    {/* 3. Conditional Tick Icon */}
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={12} color="white" strokeWidth={4} />
                      </View>
                    )}

                    <AppText style={[
                        styles.label,
                        isSelected && { color: "#ff7606ff", fontWeight: "bold" } // Optional: Highlight text too
                      ]}>
                      {item.name}
                    </AppText>
                    
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: { marginTop: -10 },
  title: { paddingHorizontal: 10, marginTop: 20, marginBottom: 8, color: "#555" },
  row: { justifyContent: "center" },
  item: { alignItems: "center", justifyContent: "center", width: 65, marginLeft: 2 },
  imageContainer: { flexDirection: "column", alignItems: "center", width: "100%" },
  
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    borderRadius: 40,
    // Border is now handled dynamically in the inline style above
  },
  
  // New style for the checkmark circle
  checkIcon: {
    backgroundColor: "#ff7606ff",
    borderRadius: 60,
    padding: 2,
    position: "absolute",
    right: 0, // Adjusted slightly
    top: 0,   // Adjusted to sit on the corner
    zIndex: 10
  },
  
  label: { fontSize: 13, color: "#515966", textAlign: "center" },
});