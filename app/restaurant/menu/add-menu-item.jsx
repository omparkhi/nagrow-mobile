import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Switch,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { addMenuItem } from "@/redux/slices/restaurant/menuSlice";
import AppText from "@/components/AppText";
import Header from "../header";
import { useRouter } from "expo-router";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import axios from "axios";

// const categories = [
//   "Main Course",
//   "Dessert",
//   "Snacks",
//   "Beverages",
//   "Appetizers",
// ];

export default function AddMenuItemModal() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.menu);
  const { restaurant } = useSelector(state => state.restaurantAuth);
  const restaurantId = restaurant?._id;

  // Dynamic Data
  const [categories, setCategories] = useState([]);
  const [addonGroups, setAddonGroups] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    // category: "Main Course",
    FoodType: "veg",
    isAvailable: true,
    image: null,
    price: "",
    categoryId: "",
    subCategory: ""
  });

  // Variant State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([
    { name: "Half", price: "" },
    { name: "Full", price: "" }
  ]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);

  // 1. Fetch Categories & Addons
  useEffect(() => {
    if(restaurantId) {
        Promise.all([
            axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/restaurant/category/get/${restaurantId}`),
            axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/restaurant/addons/get/${restaurantId}`)
        ]).then(([catRes, addRes]) => {
            setCategories(catRes.data.categories || []);
            setAddonGroups(addRes.data.addonGroups || []);
            if(catRes.data.categories.length > 0) setFormData(p => ({...p, categoryId: catRes.data.categories[0]._id}));
        }).catch(e => console.log(e)).finally(() => setIsFetching(false));
    }
  }, [restaurant]);

  const currentCategory = categories.find(c => c._id === formData.categoryId);
  const SubCats = currentCategory ? currentCategory.subCategories : [];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 4],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0] });
    }
  };

  // Manage Variant Rows
  const addVariantRow = () => {
    setVariants([...variants, { name: "", price: "" }]);
  };

  const removeVariantRow = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const submitHandler = () => {
    if (!formData.name || !formData.description || !formData.categoryId || !formData.image) {
      Alert.alert("Missing Fields", "Please fill name, description and upload an image.");
      return;
    }

    let finalPrice = formData.price;
    let finalVariants = [];

    if (hasVariants) {
      // Filter out incomplete rows
      finalVariants = variants.filter(v => v.name && v.price);

      if (finalVariants.length === 0) {
        Alert.alert("Invalid Variants", "Please add at least one variant (e.g. Full Plate).");
        return;
      }

      // Calculate Base Price (Lowest Price) 
      const prices = finalVariants.map(v => parseFloat(v.price));
      finalPrice = Math.min(...prices).toString();
    } else {
      if (!formData.price) {
        Alert.alert("Missing Price", "Please enter the item price.");
        return;
      }
    }

    const submissionData = {
      ...formData,
      price: finalPrice,
      hasVariants: hasVariants,
      variants: hasVariants ? JSON.stringify(finalVariants) : "[]", // Stringify for FormData
      addonGroups: JSON.stringify(selectedAddonIds) // Send IDs
    };

    dispatch(addMenuItem({ restaurantId, formData: submissionData }))
      .unwrap()
      .then(() => router.push("/restaurant/menu/items"))
      .catch((err) => Alert.alert("Error", err.message || "Failed to add item"));
  };

  const toggleAddon = (id) => {
    setSelectedAddonIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  if(isFetching) return <ActivityIndicator style={{flex:1}} color="#ff5733"/>;

  return (
    <>
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <AppText style={styles.modalTitle}>Add Menu Item</AppText>

           {/* basic info */}
          <TextInput
            placeholder="Item Name (e.g. Butter Chicken)"
            placeholderTextColor="#999"
            style={[styles.input, { fontFamily: "Nunito-Regular", color: "#000" }]}
            value={formData.name}
            onChangeText={(v) => setFormData({ ...formData, name: v })}
          />

          <TextInput
            placeholder="Description"
            placeholderTextColor="#999" //6e6e6eff
            style={[styles.input, styles.textArea, { fontFamily: "Nunito-Regular", color: "#000" }]}
            value={formData.description}
            multiline
            numberOfLines={3}
            onChangeText={(v) => setFormData({ ...formData, description: v })}
          />

          {/* food type (veg / non-veg) */}
          <View style={styles.rowTypeBetween}>
            <AppText style={styles.label}>Type</AppText>
            <View style={styles.toggleGroup}>
              <TouchableOpacity 
                style={[styles.typeBtn, formData.FoodType === "veg" && styles.vegActive]}
                onPress={() => setFormData({...formData, FoodType: "veg"})}
              >
                <AppText style={[styles.typeText, formData.FoodType === "veg" && {color: 'white'}]}>Veg</AppText>
              </TouchableOpacity>
              <AppText variant="light" style={{ fontSize: 30, lineHeight: 30, color: "#9c9c9cff" }}>|</AppText>
              <TouchableOpacity 
                style={[styles.typeBtn, formData.FoodType === "non-veg" && styles.nonVegActive]}
                onPress={() => setFormData({...formData, FoodType: "non-veg"})}
              >
                <AppText style={[styles.typeText, formData.FoodType === "non-veg" && {color: 'white'}]}>Non-Veg</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* category */}
          {/* <AppText style={styles.label}>Category</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, formData.category === cat && styles.categoryButtonSelected]}
                onPress={() => setFormData({ ...formData, category: cat })}
              >
                <AppText style={[styles.categoryButtonText, formData.category === cat && styles.categoryButtonTextSelected]}>
                  {cat}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView> */}

          <AppText style={styles.label}>Category</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:15}}>
            {categories.map(cat => (
                <TouchableOpacity key={cat._id} onPress={()=>setFormData({...formData, categoryId:cat._id, subCategory:""})} 
                    style={[styles.pill, formData.categoryId===cat._id && styles.pillActive]}>
                    <AppText variant="small" style={{color: formData.categoryId===cat._id?'white':'#333'}}>{cat.name}</AppText>
                </TouchableOpacity>
            ))}
            
        </ScrollView>
        <TouchableOpacity onPress={() => router.push("/restaurant/menu/CreateCategoryScreen")}>
          <AppText style={{ fontSize: 12, color: "#ff7700ff", marginTop: -15 }}>Add new category</AppText>
        </TouchableOpacity>

        {/* Sub Category Selector */}
        {SubCats.length > 0 && (
            <>
                <AppText style={styles.label}>Sub Category</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:15}}>
                    {SubCats.map((sub, i) => (
                        <TouchableOpacity key={i} onPress={()=>setFormData({...formData, subCategory:sub})} 
                            style={[styles.pill, formData.subCategory===sub && styles.pillActive]}>
                            <AppText variant="small" style={{color: formData.subCategory===sub?'white':'#333'}}>{sub}</AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </>
        )}


          {/* Addons Section */}
        <AppText style={styles.label}>Link Addon Groups</AppText>
        {addonGroups.length === 0 ? <AppText style={{color:'#999', marginBottom:15}}>No addon groups found. Create them first.</AppText> : 
            addonGroups.map(grp => (
                <TouchableOpacity key={grp._id} style={[styles.addonRow, selectedAddonIds.includes(grp._id) && styles.addonActive]} onPress={()=>toggleAddon(grp._id)}>
                    <AppText style={{ color: "#666", fontSize: 14 }}>{grp.title}</AppText>
                    <Ionicons name={selectedAddonIds.includes(grp._id)?"checkbox":"square-outline"} size={20} color="green"/>
                </TouchableOpacity>
            ))
        }

        
          {/* pricing logic */}
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <AppText style={styles.label}>Has Portions (Half/Full)?</AppText>
            <Switch 
              value={hasVariants} 
              onValueChange={setHasVariants}
              trackColor={{ false: "#767577", true: "#ffccbc" }}
              thumbColor={hasVariants ? "#ff5733" : "#f4f3f4"}
            />
          </View>

          {hasVariants ? (
            // VARIANT INPUTS
            <View style={styles.variantContainer}>
                {variants.map((variant, index) => (
                    <View key={index} style={styles.variantRow}>
                        <TextInput 
                            placeholder="Name (e.g. Half)" 
                            style={[styles.input, styles.variantInput]} 
                            value={variant.name}
                            onChangeText={(text) => updateVariant(index, 'name', text)}
                        />
                        <TextInput 
                            placeholder="Price" 
                            keyboardType="numeric"
                            style={[styles.input, styles.variantInput, { flex: 0.5 }]} 
                            value={variant.price}
                            onChangeText={(text) => updateVariant(index, 'price', text)}
                        />
                        {variants.length > 1 && (
                            <TouchableOpacity onPress={() => removeVariantRow(index)} style={styles.trashBtn}>
                                <Feather name="trash-2" size={20} color="#ff4d4d" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                
                <TouchableOpacity style={styles.addVarBtn} onPress={addVariantRow}>
                    <Ionicons name="add-circle-outline" size={20} color="#ff5733" />
                    <AppText variant="small" style={{ color: "#ff5733", marginLeft: 5 }}>Add another portion</AppText>
                </TouchableOpacity>
            </View>
        ) : (
            // STANDARD SINGLE PRICE
            <TextInput
                placeholder="Price (₹)"
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(v) => setFormData({ ...formData, price: v })}
            />
        )}

          {/* <TextInput
            placeholder="Price"
            placeholderTextColor="#6e6e6eff"
            style={[styles.input, { fontFamily: "Nunito-Regular", color: "#000" }]}
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(v) => setFormData({ ...formData, price: v })}
          /> */}

          {/* Modern Category Selector
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
          </ScrollView> */}

          {/* Availability */}
          {/* <View style={styles.availabilityRow}>
            <AppText style={styles.availabilityText}>Available</AppText>
            <Switch
              value={formData.isAvailable}
              onValueChange={(v) => setFormData({ ...formData, isAvailable: v })}
            />
          </View> */}

          {/* Image Picker */}
          {/* <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image
                source={{ uri: formData.image.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <AppText style={styles.imageText}>Upload Image</AppText>
            )}
          </TouchableOpacity> */}

          {/* Buttons */}
          {/* <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <AppText variant="small" style={styles.cancelBtnText}>Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={submitHandler} disabled={loading}>
              <AppText variant="small" style={styles.submitBtnText}>
                {loading ? "Adding..." : "Add Item"}
              </AppText>
            </TouchableOpacity>
          </View> */}

          {/* --- 5. Image & Availability --- */}
        <View style={styles.rowBetween}>
          <AppText style={styles.label}>Available Now</AppText>
          <Switch
            value={formData.isAvailable}
            onValueChange={(v) => setFormData({ ...formData, isAvailable: v })}
            trackColor={{ false: "#767577", true: "#b5cafaff" }}
            // thumbColor={"#2464f8ff" }
            // thumbColor={{true: "#2464f8ff", false:  "#f4f3f4"}}
          />
        </View>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {formData.image ? (
            <Image source={{ uri: formData.image.uri }} style={styles.imagePreview} />
          ) : (
            <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="add-a-photo" size={32} color="#888" />
                <AppText style={styles.imageText}>Upload Food Image</AppText>
            </View>
          )}
        </TouchableOpacity>

        {/* --- Buttons --- */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <AppText variant="small" style={styles.cancelBtnText}>Cancel</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={submitHandler} disabled={loading}>
            <AppText variant="small" style={styles.submitBtnText}>
              {loading ? "Saving..." : "Save Item"}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 24 },
  modalTitle: { fontSize: 22, textAlign: "center", marginBottom: 20 },
  
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontFamily: "Nunito-Regular",
    color: "#333"
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  
  label: { fontSize: 14, color: "#666", marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  rowTypeBetween: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },

  // Food Type Toggle
  toggleGroup: { flexDirection: 'row', backgroundColor: '#ebebebff', borderRadius: 10, padding: 5,  },
  typeBtn: { paddingVertical: 3, paddingHorizontal: 16, borderRadius: 8 },
  vegActive: { backgroundColor: '#00ac22' },
  nonVegActive: { backgroundColor: '#d11f1f' },
  typeText: { fontSize: 12, color: '#666' },

  // Category
  categoryScroll: { marginBottom: 16 },
  categoryButton: { backgroundColor: "#f0f0f0", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  categoryButtonSelected: { backgroundColor: "#ff5733" },
  categoryButtonText: { fontSize: 14, color: "#555" },
  categoryButtonTextSelected: { color: "#fff" },

  // Variants
  variantContainer: { backgroundColor: "#fff5f2", padding: 10, borderRadius: 12, marginBottom: 16 },
  variantRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 8 },
  variantInput: { marginBottom: 0, backgroundColor: "#fff", flex: 1 },
  trashBtn: { padding: 10 },
  addVarBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 },

  // Image
  imagePicker: {
    backgroundColor: "#f0f0f0",
    height: 160,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed"
  },
  imagePreview: { width: "100%", height: "100%", borderRadius: 16 },
  imageText: { color: "#888", fontSize: 14, marginTop: 5 },

  // Actions
  buttonRow: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: "#f0f0f0", padding: 14, borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#333" },
  submitBtn: { flex: 1, backgroundColor: "#ff5733", padding: 14, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff" },
  pill: { paddingVertical:8, paddingHorizontal:16, backgroundColor:'#f0f0f0', borderRadius:20, marginRight:10 },
  pillActive: { backgroundColor:'#ff5733' },
  addonRow: { flexDirection:'row', alignItems: "center", justifyContent:'space-between', paddingHorizontal:10, borderWidth:1, borderColor:'#eee', borderRadius:8 },
  addonActive: { backgroundColor:'#e0f2f1', borderColor:'green' },
});
