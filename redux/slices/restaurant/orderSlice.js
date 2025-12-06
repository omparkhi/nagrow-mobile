import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


 const API_BASE = process.env.EXPO_PUBLIC_API_URL;


export const fetchOrder = createAsyncThunk(
    "orders/fetchOrder",   
    async(restaurantId, thunkAPI) => {
        try {
            const res = await axios.get(`${API_BASE}/api/get/orders/${restaurantId}`);
            return res.data.order;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    "orders/fetchOrderById",
    async(orderId, thunkAPI) => {
        try {
            const res = await axios.get(`${API_BASE}/api/order/details/${orderId}`);
            return res.data.order;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    "orders/updateOrderStatus",
    async({ id, status }, thunkAPI) => {
        try {
            const res = await axios.put(`${API_BASE}/api/get/orders/update-status`, 
                {id, status}
            );
            return res.data.order;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || err.message);
        }
    }
)

const orderSlice = createSlice({
    name: "orders",
    initialState: {
    list: [],
    active: [],
    completed: [],
    currentOrder: null,
    loadingList: false,
    loadingDetails: false,
    updatingStatus: false,
    error: null,
  },

  extraReducers: (builder) => {
    // FETCH ALL ORDERS
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload;

        state.active = action.payload.filter((o) =>
            ["placed", "accepted", "preparing", "ready", "on the way"].includes(o.status)
        );

        state.completed = action.payload.filter((o) =>
            ["delivered", "cancelled"].includes(o.status)
        );
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload;
      });

    // FETCH ORDER BY ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      });

    // UPDATE ORDER STATUS
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updated = action.payload;

        // Update in list
        const index = state.list.findIndex((o) => o._id === updated._id);
        if (index !== -1) state.list[index] = updated;

        // Rebuild active & completed lists optimally
        state.active = state.list.filter((o) =>
            ["placed", "accepted", "preparing", "ready", "on the way"].includes(o.status)
        );

        state.completed = state.list.filter((o) =>
          ["delivered", "cancelled"].includes(o.status)
        );

        if (state.currentOrder && state.currentOrder._id === updated._id) {
          state.currentOrder = updated;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;