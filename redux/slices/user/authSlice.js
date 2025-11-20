    import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
    import axios from "axios";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    const API_BASE = process.env.EXPO_PUBLIC_API_URL;

    // login
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
                return rejectWithValue(err.response?.data?.message || "Login failed");
            }
        }
    );

    // signup
    export const signupUser = createAsyncThunk(
        "auth/signupUser",
        async (formData, { rejectWithValue }) => {
            try {
                const res = await axios.post(`${API_BASE}/api/users/register`, formData);

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
                return rejectWithValue(err.response?.data?.message || "Signup failed");
            }
        }
    );
 // fetch profile
    export const fetchUser = createAsyncThunk(
        "auth/fetchUser",
        async (_, { rejectWithValue }) => {
            try {
                const userId = await AsyncStorage.getItem("userId");
                const token = await AsyncStorage.getItem("token");

                if (!userId || !token) return null;

                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                const res = await axios.get(`${API_BASE}/api/users/profile/${userId}`);

                if (!res.data.success) {
                    return rejectWithValue("Failed to fetch user");
                }

            return { user: res.data.user, token };
    } catch (err) {
      return rejectWithValue("Fetch user failed");
    }
  }
);


    // auth slice
    const authslice = createSlice({
        name: "auth",
        initialState: {
            user: null,
            token: null,
            loading: false,
            error: null,
            isAuthenticated: false,
        },

        reducers: {
            logout: (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;

                AsyncStorage.removeItem("token");
                AsyncStorage.removeItem("userId");
                AsyncStorage.removeItem("userType");

                delete axios.defaults.headers.common["Authorization"];
            },
        },

        extraReducers: (builder) => {
            builder
            //login handler
                .addCase(loginUser.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })  
                .addCase(loginUser.fulfilled, (state, action) => {
                    state.loading = false;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                })
                .addCase(loginUser.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }) 

            // signup handler
                .addCase(signupUser.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })  
                .addCase(signupUser.fulfilled, (state, action) => {
                    state.loading = false;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                })
                .addCase(signupUser.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })

                // fetch profile
                .addCase(fetchUser.fulfilled, (state, action) => {
                    if (!action.payload) return;

                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                })
                .addCase(fetchUser.rejected, (state) => {
                    state.user = null;
                    state.token = null;
                    state.isAuthenticated = false;
                });

        },

    });

    export const { logout } = authslice.actions;
    export default authslice.reducer;