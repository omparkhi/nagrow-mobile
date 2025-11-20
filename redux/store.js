import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/user/restaurantSlice";
import signupReducer from "./slices/user/signupSlice";
import addressReducer from "./slices/user/addressSlice";
import loginReducer from "./slices/user/loginSlice";
import cartReducer from "./slices/cart/cartSlice";
import authReducer from "./slices/user/authSlice";

export const store = configureStore({
    reducer: {
        restaurants: restaurantReducer,
        // auth: signupReducer,
        address: addressReducer,
        login: loginReducer,
        cart: cartReducer,
        auth: authReducer,
    },
});