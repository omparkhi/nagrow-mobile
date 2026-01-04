import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const addMenuItem = createAsyncThunk(
    "menu/addMenuItem" ,
    async ({ restaurantId, formData }, { rejectWithValue  }) => {
        try {
          const token = await AsyncStorage.getItem("token");
            const data = new FormData();
            data.append("restaurantId", restaurantId);
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            // data.append("category", formData.category);
            data.append("isAvailable", formData.isAvailable);
            
            data.append("FoodType", formData.FoodType);
            data.append("hasVariants", formData.hasVariants);

            data.append("categoryId", formData.categoryId);
            data.append("subCategory", formData.subCategory);
            data.append("addonGroups", formData.addonGroups);

            // Pass the Stringified Variants
            if (formData.hasVariants) {
              data.append("variants", formData.variants); 
            }

            if (formData.image) {
                data.append("image", {
                uri: formData.image.uri,
                type: "image/jpeg",
                name: "menu.jpg",
            });
        }

        const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/restaurant/menu/add`;
      console.log("Sending Request to:", apiUrl);
            const res = await fetch( apiUrl, 
              {
                method: "POST",
                headers: {
                  // 👇 CRITICAL: Do NOT set Content-Type. Fetch detects FormData automatically.
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`, // Manually add token
                },
                body: data,
              }
            );
            const result = await res.json();

            //Handle Errors manually (Fetch doesn't throw on 400/500)
            if (!res.ok) {
              throw new Error(result.message || "Server Error");
            }

            console.log("Upload Success:", result);
            return result.menuItem;
        } catch (error) {
          console.error("Add Menu Error:", error.message);
          return rejectWithValue(error.message || "Network request failed");
        }
    }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMenuItem.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default menuSlice.reducer;