import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FoodType from "@/app/user/component/FoodType";

const STORAGE_KEY = "nagrow_cart_v9";

// Helper: Generate Unique Cart ID
const generateCartId = (menuId, variantId, addons = []) => {
  const sortedAddons = addons.map((a) => a._id).sort().join("_"); 
  return `${menuId}-${variantId || "base"}-${sortedAddons}`;
};

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
  initialState: { ...defaultCart , loaded: false },
  reducers: {
    setRestaurant(state, action) {
      state.restaurantId = action.payload.restaurantId;
      state.restaurantName = action.payload.restaurantName;
      saveToStorage(state);
    },
    replaceCart(state, action) {
      const { restaurantId, restaurantName, items } = action.payload;
      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;
      state.items = items;
      state.tip = 0;
      saveToStorage(state);
    },
    addOrUpdateItem(state, action) {
      const newItem = action.payload;
      const existing = state.items.find((i) => i.id === newItem.id);
      if (existing) {
        existing.quantity += newItem.quantity;
        // ✅ ADDED: Update timestamp to make this the "latest" interaction
        existing.createdAt = Date.now();
      } else {
        state.items.push(newItem);
      }
      saveToStorage(state);
    },

    // 🔥 NEW: Removes all previous customizations of an item (Used for "Update" logic)
    removeItemsByMenuId(state, action) {
      const menuItemId = action.payload;
      state.items = state.items.filter(i => i.menuItemId !== menuItemId);

      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
      }

      saveToStorage(state);
    },

    // 🔥 NEW: Removes the last added variant (Used for list decrement)
    // 🔁 CHANGED: Updated to be purely Deterministic LIFO based on createdAt
    removeLastVariantOfItem(state, action) {
      const menuItemId = action.payload;
      
      // 1. Find all items for this menuId
      const candidates = state.items.filter(i => i.menuItemId === menuItemId);
      
      if (candidates.length > 0) {
          // 2. Sort by createdAt DESC (Newest first)
          candidates.sort((a, b) => b.createdAt - a.createdAt);
          const targetItem = candidates[0];

          // 3. Find index in main array
          const index = state.items.findIndex(i => i.id === targetItem.id);
          
          if (index !== -1) {
              if (state.items[index].quantity > 1) {
                  state.items[index].quantity -= 1;
                  state.items[index].createdAt = Date.now(); // Update timestamp on modify
              } else {
                  state.items.splice(index, 1);
              }
          }
      }

      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
      }
      saveToStorage(state);
    },

    increment(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity += 1;
        item.createdAt = Date.now(); // Update timestamp
      }
      saveToStorage(state);
    },
    decrement(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity -= 1;
        item.createdAt = Date.now(); // Update timestamp
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }

      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
      }
      saveToStorage(state);
    },

    updateQty(state, action) {
      const { id, delta } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (!item) return;

      item.quantity += delta;
      if (item.quantity <= 0) {
        state.items = state.items.filter(i => i.id !== id);
      }
      saveToStorage(state);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveToStorage(state);
    },
    clearCart(state) {
      Object.assign(state, defaultCart);
      state.loaded = true;
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
  async ({ menuItem, restaurant, selectedVariant = null, selectedAddons = [], quantity = 1 }, { getState, dispatch }) => {
    try {
        const state = getState().cart;

        // 1. Conflict Check
        if (state.restaurantId && state.restaurantId !== restaurant._id) {
          return { success: false, conflict: true, currentRestaurant: state.restaurantName };
        }

        // 2. Init Restaurant
        if (!state.restaurantId) {
          dispatch(cartSlice.actions.setRestaurant({ restaurantId: restaurant._id, restaurantName: restaurant.name }));
        }

        // 3. Price Calculation (Strict Numbers to prevent strings)
        const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(menuItem.price);
        const addonTotal = selectedAddons.reduce((acc, curr) => acc + Number(curr.price), 0);
        const finalPrice = basePrice + addonTotal;

        // 4. Name Construction
        let finalName = menuItem.name;
        if (selectedVariant) finalName += ` (${selectedVariant.name})`;

        // 5. Generate Unique ID
        // 🔥 FIXED: Now calling the correctly named function
        const cartItemId = generateCartId(menuItem._id, selectedVariant?._id, selectedAddons);

        const payload = {
          id: cartItemId, // Unique ID
          FoodType: menuItem.FoodType,
          menuItemId: menuItem._id, // DB Reference
          variantId: selectedVariant?._id, // DB Reference (can be undefined)
          selectedAddons: selectedAddons, // Full Array
          name: finalName,
          price: finalPrice,
          image: menuItem.image || "",
          quantity: quantity,
          createdAt: Date.now() // ✅ ADDED: Timestamp for LIFO logic
        };

        dispatch(cartSlice.actions.addOrUpdateItem(payload));
         

  const updatedState = getState().cart;
  // await saveToStorage(updatedState); // ensure AsyncStorage is updated
        return { success: true };

    } catch (error) {
        console.error("ADD TO CART ERROR:", error);
        return { success: false, error: error.message };
    }
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

export const getMenuQty = (state, menuItemId) => 
    state.cart.items.filter(i => i.menuItemId === menuItemId).reduce((sum, i) => sum + i.quantity, 0);

export const getGrandTotal = (state, distanceKm = 0) => {
  const subtotal = getSubtotal(state);
  const delivery = getDeliveryFee(state, distanceKm);
  const tip = Number(state.cart.tip) || 0;
  return subtotal + delivery + tip;
};

export const {
  setRestaurant,
  addOrUpdateItem,
  updateQty,
  increment,
  decrement,
  removeItem,
  clearCart,
  setTip,
  replaceCart,
  removeItemsByMenuId, 
  removeLastVariantOfItem
} = cartSlice.actions;

export default cartSlice.reducer;
