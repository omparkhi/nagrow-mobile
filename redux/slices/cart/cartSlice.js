import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "nagrow_cart_v1";

const defaultCart = {
  restaurantId: null,
  restaurantName: null,
  items: [],
  tip: 0,
};


// helper functions
const loadFromStorage = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultCart;
  } catch (err) {
    console.log("AsyncStorage load error:", err);
    return defaultCart;
  }
};

const saveToStorage = async (state) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.log("AsyncStorage save error:", err);
  }
};

// Load cart only once
export const loadCart = createAsyncThunk("cart/loadCart", async () => {
  return await loadFromStorage();
});

// cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    restaurantId: null,
    restaurantName: null,
    items: [],
    tip: 0,
    loaded: false,
  },
  reducers: {
    setRestaurant(state, action) {
      state.restaurantId = action.payload.restaurantId;
      state.restaurantName = action.payload.restaurantName;
      saveToStorage(state);
    },
    addOrUpdateItem(state, action) {
      const item = action.payload;
      const found = state.items.find((i) => i.id === item.id);
      if (found) {
        found.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      saveToStorage(state);
    },
    increment(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
      saveToStorage(state);
    },
    decrement(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }
      saveToStorage(state);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveToStorage(state);
    },
    clearCart(state) {
      state.restaurantId = null;
      state.restaurantName = null;
      state.items = [];
      state.tip = 0;
      saveToStorage(state);
    },
    setTip(state, action) {
      state.tip = action.payload;
      saveToStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCart.fulfilled, (state, action) => {
      Object.assign(state, action.payload);
      state.loaded = true;
    });
  },
});

// add to cart thunk
export const addToCartThunk = createAsyncThunk(
  "cart/addItem",
  async ({menuItem, restaurant},{getState, dispatch})=> {
  const state = getState().cart;

   if (!restaurant || !restaurant._id) {
      console.log("❌ ERROR: restaurant undefined");
      return { success: false };
    }

  if (state.restaurantId && state.restaurantId !== restaurant._id) {
    return {
      success: false,
      conflict: true,
      currentRestaurant: state.restaurantName,
    };
  }

  const payload = {
    id: menuItem._id,
    name: menuItem.name,
    price: menuItem.price,
    image: menuItem.image || "",
    quantity: 1,
  };

  dispatch(cartSlice.actions.addOrUpdateItem(payload));

  if (!state.restaurantId) {
    dispatch(
      cartSlice.actions.setRestaurant({
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
      })
    );
  }

  const updatedState = getState().cart;
  await saveToStorage(updatedState); // ensure AsyncStorage is updated

  return { success: true };
}
);

// -------- SELECTORS --------
export const getCart = (state) => state.cart;
export const getItems = (state) => state.cart.items;

export const getRestaurant = (state) => ({
  id: state.cart.restaurantId,
  name: state.cart.restaurantName,
});

export const getTotalItems = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const getSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const getDeliveryFee = (_, distanceKm = 0) =>
  Math.ceil(distanceKm * 12);

export const getGrandTotal = (state, distanceKm = 0) => {
  const subtotal = getSubtotal(state);
  const delivery = getDeliveryFee(state, distanceKm);
  const tip = Number(state.cart.tip) || 0;
  return subtotal + delivery + tip;
};

export const {
  setRestaurant,
  addOrUpdateItem,
  increment,
  decrement,
  removeItem,
  clearCart,
  setTip,
} = cartSlice.actions;

export default cartSlice.reducer;
