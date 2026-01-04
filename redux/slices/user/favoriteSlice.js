import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const getMyFavorites  = createAsyncThunk(
    "favorite/fetchIds", 
    async (_, thunkAPI) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const { data } = await axios.get(`${API_BASE}/api/user/get-favorite`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addFavorite = createAsyncThunk(
    "favorite/add", 
    async ({ restaurantId, menuItemId }, thunkAPI) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const { data } = await axios.post(`${API_BASE}/api/user/add-favorite`, 
                { restaurantId, menuItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// ... existing imports

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: {
    favoriteIds: [],
    favoritesList: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder
    .addCase(getMyFavorites.pending, (state) => {
      state.loading = true;
    })
    .addCase(getMyFavorites.fulfilled, (state, action) => {
      state.loading = false;
      state.favoriteIds = action.payload.favoritesIds;
      state.favoritesList = action.payload.favorites;
    });

    

    builder.addCase(addFavorite.fulfilled, (state, action) => {
      const { action: type, menuItemId } = action.payload;

      if (type === "added") {
        if (!state.favoriteIds.includes(menuItemId)) {
          state.favoriteIds.push(menuItemId);
        }
      } else {
        state.favoriteIds = state.favoriteIds.filter(
          id => id !== menuItemId
        );
      }
    });
  },
});

export default favoriteSlice.reducer;