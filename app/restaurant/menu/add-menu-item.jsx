import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { addMenuItem } from "@/redux/slices/restaurant/menuSlice";
import AppText from "@/components/AppText";
import Header from "../header";
import { useRouter } from "expo-router";

const categories = [
  "Main Course",
  "Dessert",
  "Snacks",
  "Beverages",
  "Appetizers",
];

export default function AddMenuItemModal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    isAvailable: true,
    image: null,
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.menu);
  const { restaurant } = useSelector(state => state.restaurantAuth);
  const restaurantId = restaurant?._id;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 4],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0] });
    }
  };

  const submitHandler = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      alert("Fill all fields & upload image");
      return;
    }

    dispatch(addMenuItem({ restaurantId, formData }))
      .unwrap()
      .then(() => router.push("/restaurant/menu/items"))
      .catch((err) => alert(err));
  };

  return (
    <>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <AppText style={styles.modalTitle}>Add Menu Item</AppText>

          <TextInput
            placeholder="Item Name"
            placeholderTextColor="#6e6e6eff"
            style={[styles.input, { fontFamily: "Nunito-Regular", color: "#000" }]}
            value={formData.name}
            onChangeText={(v) => setFormData({ ...formData, name: v })}
          />

          <TextInput
            placeholder="Description"
            placeholderTextColor="#6e6e6eff"
            style={[styles.input, styles.textArea, { fontFamily: "Nunito-Regular", color: "#000" }]}
            value={formData.description}
            multiline
            numberOfLines={3}
            onChangeText={(v) => setFormData({ ...formData, description: v })}
          />

          <TextInput
            placeholder="Price"
            placeholderTextColor="#6e6e6eff"
            style={[styles.input, { fontFamily: "Nunito-Regular", color: "#000" }]}
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(v) => setFormData({ ...formData, price: v })}
          />

          {/* Modern Category Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => {
              const isSelected = formData.category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat })}
                >
                  <AppText
                    style={[
                      styles.categoryButtonText,
                      isSelected && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {cat}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Availability */}
          <View style={styles.availabilityRow}>
            <AppText style={styles.availabilityText}>Available</AppText>
            <Switch
              value={formData.isAvailable}
              onValueChange={(v) => setFormData({ ...formData, isAvailable: v })}
            />
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image
                source={{ uri: formData.image.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <AppText style={styles.imageText}>Upload Image</AppText>
            )}
          </TouchableOpacity>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <AppText variant="small" style={styles.cancelBtnText}>Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={submitHandler} disabled={loading}>
              <AppText variant="small" style={styles.submitBtnText}>
                {loading ? "Adding..." : "Add Item"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    height: "100%",
    backgroundColor: "#fff",
  },
  modalContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  textArea: {
    color: "#000",
    minHeight: 60,
    textAlignVertical: "top",
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: "#ff5733",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#555",
  },
  categoryButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  availabilityText: {
    color: "#555",
    fontSize: 16,
  },
  imagePicker: {
    backgroundColor: "#e0e0e0",
    height: 160,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  imageText: {
    color: "#888",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#ff5733",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
  },
});
