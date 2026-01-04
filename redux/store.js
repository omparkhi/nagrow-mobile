import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";

import restaurantReducer from "./slices/user/restaurantSlice";
import addressReducer from "./slices/user/addressSlice";
import loginReducer from "./slices/user/loginSlice";
import cartReducer from "./slices/cart/cartSlice";
import authReducer from "./slices/user/authSlice";
import userOrderReducer from "./slices/user/userOrderSlice";

import resAuthReduces from "./slices/restaurant/authSlice"
import resOrderReducer from "./slices/restaurant/orderSlice";
import menuReducer from "./slices/restaurant/menuSlice";

import riderReducer from "./slices/rider/authSlice";
import riderOrderReducer from "./slices/rider/riderOrderSlice";
import riderTrackingReducer from "./slices/rider/riderTrackingSlice";

import riderLocationReducer from "./slices/rider/riderLocationSlice";
import mapReducer from "./slices/map/mapSlice";

import riderDeliveryReducer from "./slices/rider/riderDeliverySlice";
import riderHistoryReducer from "./slices/rider/riderHistorySlice";
import riderEarningReducer from "./slices/rider/riderEarningSlice";

import favoriteReducer from "./slices/user/favoriteSlice";

const rootReducer = combineReducers({
    restaurants: restaurantReducer,
    address: addressReducer,
    login: loginReducer,
    cart: cartReducer,
    auth: authReducer,
    restaurantAuth: resAuthReduces,
    riderAuth: riderReducer,
    orders: resOrderReducer,
    menu: menuReducer,
    riderOrder: riderOrderReducer,
    riderTracking: riderTrackingReducer,
    riderLocation: riderLocationReducer,
    mapState: mapReducer,
    riderDelivery: riderDeliveryReducer,
    userOrder: userOrderReducer,
    riderHistory: riderHistoryReducer,
    riderEarning: riderEarningReducer,
    favorites: favoriteReducer,
});

const persistConfig = {
    key: "root",
    storage: AsyncStorage,

    whitelist: [
    "auth",            // user login
    "restaurantAuth",  // restaurant login
    "riderAuth",       // rider login
    "riderTracking",
    "riderLocation",
    "mapState",   // ⬅️ IMPORTANT for your issue
    "cart",            // optional but useful
    "address",         // optional
    "riderDelivery",
    "userOrder",
    "riderHistory",
    "riderEarning",
    "favorites"
  ],
};

// persist root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);