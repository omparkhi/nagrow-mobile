import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchRestaurants = createAsyncThunk(
    "restaurants/fetchRestaurants",
    async (_, thunkAPI) => {
        // console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
        try {
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/restaurants/home`);
            return res.data.restaurants;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "failed to fetch restaurant");
        }
    }
);

export const fetchRestaurantById = createAsyncThunk(
    "restaurant/fetchRestaurantById",
    async (id, thunkAPI) => {
        try {
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/restaurants/${id}`);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "failed to fetch restaurant by id");
        }
    }
);

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState: {
        data: [],
        restaurant: null,
        menu: null,
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRestaurants.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //fetch restaurant detail by id
            .addCase(fetchRestaurantById.pending, (state) => {
                state.loading = true;
                state.restaurant = null;
                state.menu = null;
            })
            .addCase(fetchRestaurantById.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurant = action.payload.restaurant;
                state.menu = action.payload.menu;
            })
            .addCase(fetchRestaurantById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default restaurantSlice.reducer;