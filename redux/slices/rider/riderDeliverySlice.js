import { createSlice } from "@reduxjs/toolkit";

const riderDeliverySlice = createSlice({
    name: "riderDelivery",
    initialState: {
        request: null,
        showModal: false,
    },
    reducers: {
        setDeliveryRequest(state, action) {
            state.request = action.payload;
            state.showModal = true;
        },
        clearDeliveryRequest(state) {
            state.request = null;
            state.showModal = false;
        }
    }
});

export const { setDeliveryRequest, clearDeliveryRequest } = riderDeliverySlice.actions;
export default riderDeliverySlice.reducer;