import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/api/users/register`, formData);

            if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const { token, user } = res.data;

            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("userId", user.id);
            await AsyncStorage.setItem("userType", "user");

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { user, token };
        } catch (err) {
            console.log("SIGNUP ERROR:", err.response?.data || err.message || err);
            return rejectWithValue(
                err.response?.data?.message || "Registration failed"
            );
        }
    }
);

const signupSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default signupSlice.reducer;