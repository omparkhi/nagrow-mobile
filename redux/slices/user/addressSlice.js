import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addressService } from "@/services/addressService";

// fetch
export const fetchAddresses = createAsyncThunk(
    "address/fetch",
    async (_, thunkAPI) => {
        try {
            return await addressService.getAddresses();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch");
        }
    }
);

// select
export const selectAddress = createAsyncThunk(
    "address/select",
    async (addressId, thunkAPI) => {
        try {
            return await addressService.selectAddress(addressId);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to select address");
        }
    }
);

//save
export const saveAddress = createAsyncThunk(
    "address/save",
    async (payload, thunkAPI) => {
        try {
            return await addressService.saveAddress(payload);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to save address");
        }
    }
);

//update
export const updateAddress = createAsyncThunk(
    "address/update",
    async ({ addressId, payload }, thunkAPI) => {
        try {
            return await addressService.updateAddress(addressId, payload);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update address");
        }
    }
);

//delete
export const deleteAddress = createAsyncThunk(
    "address/delete", 
    async (addressId, thunkAPI) => {
        try {
            return await addressService.deleteAddress(addressId);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete address");
        }
    }
);


const addressSlice = createSlice({
    name: "address",
    initialState: {
        addresses: [],
        selectedAddress: null,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        //fetch
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    state.addresses = action.payload.addresses || [];
                    state.selectedAddress = state.addresses.find(a => a.selectedAddress) || state.addresses[0] || null;
                    state.error = null;
                } else {
                    state.error = action.payload.message;
                    state.addresses = [];
                    state.selectedAddress = null;
                }
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.addresses = [];
                state.selectedAddress = null;
            })

            //select
            .addCase(selectAddress.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.addresses = action.payload.addresses;
                    state.selectedAddress = state.addresses.find(a => a.selectedAddress) || null;
                }
            })

            //save
            .addCase(saveAddress.fulfilled, (state, action) => {
                if (action.payload.success) {
                    const saved = action.payload.address;
                    const idx = state.addresses.findIndex(a => a._id === saved._id);
                    if (idx >= 0) state.addresses[idx] = saved;
                    else state.addresses.unshift(saved);

                    if (!state.selectedAddress) state.selectedAddress = saved;
                }
            })

            //update
            .addCase(updateAddress.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.addresses = action.payload.addresses;
                    state.selectedAddress =
                    state.addresses.find(a => a.selectedAddress) || null;
                }
            })

            //delete
             .addCase(deleteAddress.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.addresses = action.payload.addresses;
                    state.selectedAddress = state.addresses.find(a => a.selectedAddress) || state.addresses?.[0] || null;
                }
            });
    }
});


export default addressSlice.reducer;