import { createSlice } from "@reduxjs/toolkit";
import { addActivity, createGoal, getGoal, updateGoal } from "./userThunks";
import { GoalInfo } from "./userTyping";

const initialState = {
    goal: {
        data: null as GoalInfo | null,
        loading: false,
        error: null,
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // create goal
            .addCase(createGoal.fulfilled, (state, action) => {
                console.log("Goal created successfully:", action.payload);
            })

            // update goal
            .addCase(updateGoal.fulfilled, (state, action) => {
                console.log("Goal updated successfully:", action.payload)
            })

            // getting daily goals
            .addCase(getGoal.pending, (state) => {
                state.goal.loading = true;
            })
            .addCase(getGoal.fulfilled, (state, action) => {
                console.log("Goal fetched successfully:", action.payload);
                state.goal.data = action.payload;
                state.goal.loading = false;
                state.goal.error = null;
            })
            .addCase(getGoal.rejected, (state, action) => {
                console.log('get foal error:', action);
            })
            
            // add activity
            .addCase(addActivity.fulfilled, (state, action) => {
                console.log("Activity added successfully:", action.payload);
            })
    }
});

export default userSlice.reducer;