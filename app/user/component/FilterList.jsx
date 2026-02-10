import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";

function FilterChip ({ item, onPress, isSelected }) {
    // Zomato Style Colors
  const activeBg = "#f5fffbff";   // Light green BG
  const activeBorder = "#00b069ff"; // green Border
  const inactiveBg = "#ffffff";
  const inactiveBorder = "#e8e8e8"; // Light Grey Border

  return (
    <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => onPress(item)}
        style={[
            styles.chip,
            {
                backgroundColor: isSelected ? activeBg : inactiveBg,
                borderColor: isSelected ? activeBorder : inactiveBorder,
                // Sort buttons often look slightly different (shadow), but keeping it uniform usually works best
            },
        ]}
    >
        {item.leftIcon && (
            <View style={{ marginRight: 6 }}>
                {item.leftIcon}
            </View>
        )}

        <AppText 
        variant="small" 
        style={{
            fontSize: 13, 
            color: '#363636',
            fontWeight: isSelected ? '600' : '400' 
        }}
      >
        {item.label}
      </AppText>

      {isSelected && item.type !== 'sort' ? (
          // Show X if it's a toggle that is active
          <View style={{marginLeft: 6}}>
             <X size={14} color="#363636" />
          </View>
      ) : (
          // Show Chevron if it's a dropdown type
          item.type === 'dropdown' && (
            <View style={{ marginLeft: 6, marginTop: 2 }}>
                <ChevronDown size={14} color="#363636" />
            </View>
          )
      )}

    </TouchableOpacity>
  )
}

// --- MAIN LIST COMPONENT ---
export default  function FilterList ({ filters, selectedFilters = [], onFilterPress, style }) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter, index) => {
          const isSelected = selectedFilters.includes(filter.id);
          return (
            <FilterChip
              key={filter.id || index}
              item={filter}
              isSelected={isSelected}
              onPress={onFilterPress}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    // Add border bottom only if you want a separator
    // borderBottomWidth: 1, 
    // borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    paddingHorizontal: 16, // Left/Right spacing of the list
    gap: 10, // Spacing between chips
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    // Minimum width ensures small text doesn't look squashed
    minWidth: 60,
    height: 34
  },
});