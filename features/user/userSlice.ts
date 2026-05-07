import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { addActivity, createGoal, createReadingSession, getActivityDays, getGoal, updateGoal } from "./userThunks";
import { GoalInfo } from "./userTyping";

const initialState = {
    goal: {
        data: null as GoalInfo | null,
        loading: false,
        error: null as SerializedError | null,
    },
    activityDays: {
        data: [] as any[],
        loading: false,
        error: null as SerializedError | null,
    },
    createSession: {
        data: null as any | null,
        loading: false,
        error: null as SerializedError | null,
    }
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
            .addCase(updateGoal.pending, (state, action) => {
                console.log('Updating goal...');
                const data = action.meta.arg.data;
                if (state.goal.data) {
                    state.goal.data.dailyTargetSeconds = data.amount as number;
                }
            })
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
                const date = action.meta.arg.date;
                const seconds = action.meta.arg.seconds;
                const index = state.activityDays.data.findIndex((a: any) => a.date == date);
                
                if (index !== -1) {
                    const dataFromIndex = state.activityDays.data[index];
                    const _data = [
                        ...state.activityDays.data.slice(0, index),
                        {
                            ...state.activityDays.data[index],
                            secondsRead: dataFromIndex ? dataFromIndex.secondsRead + seconds : seconds,
                        },
                        ...state.activityDays.data.slice(index + 1),
                    ];

                    state.activityDays.data = _data;
                }
            })

            // get activity days
            .addCase(getActivityDays.pending, (state) => {
                console.log("Getting activity days...");
                state.activityDays.loading = true;
            })
            .addCase(getActivityDays.fulfilled, (state, action) => {
                state.activityDays.data = action.payload.data;
                state.activityDays.loading = false;
                state.activityDays.error = null;
            })
            .addCase(getActivityDays.rejected, (state, action) => {
                state.activityDays.loading = false;
                state.activityDays.error = action.error;
            })

            // create reading session
            .addCase(createReadingSession.pending, (state) => {
                state.createSession.loading = true;
                state.createSession.error = null;
            })
            .addCase(createReadingSession.fulfilled, (state, { payload }) => {
                state.createSession.loading = false;
                state.createSession.error = null;

                console.log("Reading session created:", payload);
            })
    }
});

export default userSlice.reducer;