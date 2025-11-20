import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (formData, { rejectWithValue }) => {
       try {
            const res = await axios.post(`${API_BASE}/api/users/login`, formData);
            if (!res.data.success) {
                return rejectWithValue(res.data.message);
            }

            const { user, token } = res.data;

            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("userId", user.id);
            await AsyncStorage.setItem("userType", "user");

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            return { user, token };
       } catch (err) {
            console.log("LOGIN ERROR:", err.response?.data || err.message || err);
            return rejectWithValue(
                err.response?.data?.message || "Login failed"
            );
       }

    }
) 

const loginSlice = createSlice({
    name: "login",
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
    },

    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            AsyncStorage.clear(),
            delete axios.defaults.headers.common["Authorization"];
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer;