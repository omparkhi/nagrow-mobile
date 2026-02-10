import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchRestaurants = createAsyncThunk(
    "restaurants/fetchRestaurants",
    async (coords = {}, thunkAPI) => {
        // console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
        try {
            // Build URL: /api/restaurants?lat=20.5&lng=78.8
            let url = `${process.env.EXPO_PUBLIC_API_URL}/api/user/restaurant/home`
            if (coords.lat && coords.lng) {
                url += `?lat=${coords.lat}&lng=${coords.lng}`;
            }

            const res = await axios.get(url);
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
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/user/restaurant/${id}`);
            // console.log("API Response:", res.data);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "failed to fetch restaurant by id");
        }
    }
);

export const fetchTopPicks = createAsyncThunk(
    "restaurant/fetchTopPicks" ,
    async (maxPrice, thunkAPI) => {
        try {
            const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/user/top-picks?maxPrice=${maxPrice}`);
            // console.log(res.data.items);
            return res.data.items;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "failed to fetch Top Picks");
        }
    }
)

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState: {
        data: [],
        restaurant: null,
        menu: null,
        topPicks: null,
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
            })

            //fetch restaurant top picks
            .addCase(fetchTopPicks.fulfilled, (state, action) => {
                state.topPicks = action.payload;
            })
            .addCase(fetchTopPicks.rejected, (state, action) => {
                state.error = action.error;
            });
    },
});

export default restaurantSlice.reducer;