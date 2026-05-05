import { createSlice } from "@reduxjs/toolkit";
import { createGoal } from "./tafsirsThunk";
import { GoalResponse } from "./tafsirsTyping";

const initialState = {
    goals: [] as GoalResponse[],
};

const tafsirsSlice = createSlice({
    name: 'tafsirs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createGoal.pending, () => {
                console.log("Creating goal...");
            })
            .addCase(createGoal.fulfilled, (state, { payload }) => {
                console.log("Goal created successfully:", payload);
            })
            .addCase(createGoal.rejected, (state, { payload }) => {
                console.log("Failed to create goal:", payload);
            });
    },
});

export default tafsirsSlice.reducer;