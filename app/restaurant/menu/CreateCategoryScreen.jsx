import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Alert,  
  Keyboard 
} from "react-native";
import AppText from "@/components/AppText"; // Your custom text component
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function CreateCategoryScreen() {
    const router = useRouter();
    const { restaurant } = useSelector((state) => state.restaurantAuth);
    const [loading, setLoading] = useState(false);

    // Form State
    const [categoryName, setCategoryName] = useState("");
  
    // Sub-Category Logic
    const [subCatInput, setSubCatInput] = useState("");
    const [subCategories, setSubCategories] = useState([]);

    // 1. Add Sub Category Tag
  const addSubCategory = () => {
    if (!subCatInput.trim()) return;
    if (subCategories.includes(subCatInput.trim())) {
        return Alert.alert("Duplicate", "This sub-category already exists.");
    }
    setSubCategories([...subCategories, subCatInput.trim()]);
    setSubCatInput(""); // Clear input
  };

  // 2. Remove Tag
  const removeSubCategory = (index) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
        return Alert.alert("Error", "Please enter a Category Name (e.g. Chinese)");
    }

    setLoading(true);
    try {
        const payload = {
            restaurantId: restaurant._id,
            name: categoryName,
            subCategories: subCategories
        };

        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/api/restaurant/category/create`, 
            payload
        );

        if (response.data.success) {
            Alert.alert("Success", "Category Created Successfully!");
            router.back(); // Go back to Menu Management
        }
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to create category";
        Alert.alert("Error", msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.title}>Create New Category</AppText>

        {/* --- Main Category Name --- */}
        <AppText style={styles.label}>Category Name</AppText>
        <TextInput 
            style={styles.input} 
            placeholder="e.g. Chinese, South Indian, Breads" 
            placeholderTextColor="#999"
            value={categoryName}
            onChangeText={setCategoryName}
        />

        {/* --- Sub Categories Input --- */}
        <AppText style={styles.label}>Sub Categories (Optional)</AppText>
        <AppText style={styles.hint}>Type and press '+' to add filters like Rice, Noodles, Gravy.</AppText>
        
        <View style={styles.inputRow}>
            <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                placeholder="Add sub-category..." 
                placeholderTextColor="#999"
                value={subCatInput}
                onChangeText={setSubCatInput}
                onSubmitEditing={addSubCategory} // Add on enter key
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSubCategory}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>

        {/* --- Render Added Tags --- */}
        <View style={styles.tagsContainer}>
            {subCategories.map((sub, index) => (
                <View key={index} style={styles.tag}>
                    <AppText style={styles.tagText}>{sub}</AppText>
                    <TouchableOpacity onPress={() => removeSubCategory(index)}>
                        <Ionicons name="close-circle" size={18} color="#555" style={{marginLeft:5}}/>
                    </TouchableOpacity>
                </View>
            ))}
        </View>

      </ScrollView>

      {/* --- Footer Save Button --- */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave} 
            disabled={loading}
        >
            <AppText style={styles.saveBtnText}>
                {loading ? "Creating..." : "Create Category"}
            </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 25, textAlign: "center" },
  
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 10 },
  hint: { fontSize: 12, color: "#888", marginBottom: 8 },
  
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },

  // Row for Sub Cat input
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 15 },
  addBtn: {
    backgroundColor: "#ff5733",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tags
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe0d6", // Light orange background
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffccbc",
  },
  tagText: { color: "#d84315", fontWeight: "600", fontSize: 14 },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#ff5733",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#ff5733",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});