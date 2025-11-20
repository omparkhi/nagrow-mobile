import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

 const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const loginRes = createAsyncThunk(
    "restaurantAuth/loginRes", 
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/api/restaurants/login`, formData);

            if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const { restaurant, token } = res.data;

            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("restaurantId", restaurant.id);
            await AsyncStorage.setItem("userType", "restaurant");

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { restaurant, token };

        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
);

export const signupRes = createAsyncThunk(
    "restaurantAuth/signupRes", 
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/api/restaurants/register`, formData);

            if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const { restaurant, token } = res.data;

            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("restaurantId", restaurant.id);
            await AsyncStorage.setItem("userType", "restaurant");

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { restaurant, token };
            
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Signup failed");
        }
    }
);

export const fetchResProfile = createAsyncThunk(
    "restaurantAuth/fetchResProfile", 
    async (_, { rejectWithValue }) => {
        try {
            const restaurantId = await AsyncStorage.getItem("restaurantId");
            const token = await AsyncStorage.getItem("token");

            if (!restaurantId || !token) return null;

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const res = await axios.get(`${API_BASE}/api/restaurants/profile/${restaurantId}`);

            return {restaurant: res.data.restaurant, token};

        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
        }
    }
);


const authSlice = createSlice({
    name: "restaurantAuth",
    initialState: {
        restaurant: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        logout: (state) => {
            state.restaurant= null;
            state.token = null,

            AsyncStorage.removeItem("token");
            AsyncStorage.removeItem("restaurantId");
            AsyncStorage.removeItem("userType");

            delete axios.defaults.headers.common["Authorization"];
        },
    },
    extraReducers: (builder) => {
        builder 
            // login handler
            .addCase(loginRes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginRes.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurant = action.payload.restaurant;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginRes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //signup handler
            .addCase(signupRes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupRes.fulfilled, (state, action ) => {
                state.loading = false;
                state.restaurant = action.payload.restaurant;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(signupRes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetch profile handler
            .addCase(fetchResProfile.fulfilled, (state, action) => {
                 if (!action.payload) return;

                state.restaurant = action.payload.restaurant;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(fetchResProfile.rejected, (state) => {
                state.restaurant = null;
                state.token = null;
                state.isAuthenticated = false; 
            });
    },

});


export const { logout } = authSlice.actions;
export default authSlice.reducer;