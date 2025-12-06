import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const addMenuItem = createAsyncThunk(
    "menu/addMenuItem" ,
    async ({ restaurantId, formData }, { rejectWithValue  }) => {
        try {
            const data = new FormData();
            data.append("restaurantId", restaurantId);
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("category", formData.category);
            data.append("isAvailable", formData.isAvailable);

            if (formData.image) {
                data.append("image", {
                uri: formData.image.uri,
                type: "image/jpeg",
                name: "menu.jpg",
            });
        }
            const res = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/api/restaurants/menu/add`,
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            return res.data.menuItem;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Error");
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
      })
      .addCase(addMenuItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default menuSlice.reducer;