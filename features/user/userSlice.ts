import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { supabaseCreateReadingSession } from "../reading/readingThunk";
import {
    addActivity,
    createGoal,
    createReadingSession,
    getActivityDays,
    getFailedStrike,
    getGoal,
    getLatestSession,
    getLongestStrike,
    updateGoal
} from "./userThunks";
import { GoalInfo } from "./userTyping";

const initialState = {
    goal: {
        data: null as GoalInfo | null,
        loading: false,
        error: null as SerializedError | null,
    },
    updatingGoal: {
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
    },
    latestSession: {
        data: null as any | null,
        loading: false,
        error: null as SerializedError | null,
    },
    longestStrike: {
        data: null as any | null,
        loading: false,
        error: null as SerializedError | null,
    },
    failedStrike: {
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
            .addCase(createGoal.fulfilled, (state, { meta, payload }) => {
                console.log("Goal created successfully:", payload);

                if (state.goal.data) {
                    state.goal.data.dailyTargetSeconds = meta.arg.amount as number;
                }
            })

            // update goal
            .addCase(updateGoal.pending, (state, action) => {
                console.log('Updating goal...');

                state.updatingGoal.loading = true;
                state.updatingGoal.error = null;

                const data = action.meta.arg.data;
                if (state.goal.data) {
                    state.goal.data.dailyTargetSeconds = data.amount as number;
                }
            })
            .addCase(updateGoal.fulfilled, (state, { meta, payload }) => {
                console.log("Goal updated successfully!", payload);

                state.updatingGoal.loading = false;
                state.updatingGoal.error = null;

                if (state.goal.data) {
                    state.goal.data.dailyTargetSeconds = meta.arg.data.amount as number;
                }
            })
            .addCase(updateGoal.rejected, (state, { error }) => {
                state.updatingGoal.loading = false;
                state.updatingGoal.error = error;
            })

            // getting daily goals
            .addCase(getGoal.pending, (state) => {
                state.goal.loading = true;
            })
            .addCase(getGoal.fulfilled, (state, action) => {
                console.log("Goal fetched successfully:", action.payload);
                state.goal.data = action.payload as GoalInfo;
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
            .addCase(createReadingSession.pending, (state, { meta }) => {
                state.createSession.loading = true;
                state.createSession.error = null;
            })
            .addCase(createReadingSession.fulfilled, (state, { meta, payload }) => {
                const chapterNumber = meta.arg.chapterNumber;
                const verseNumber = meta.arg.verseNumber;

                state.latestSession.data = {
                    ...state.latestSession.data,
                    chapterNumber: chapterNumber,
                    verseNumber: verseNumber,
                };

                state.createSession.loading = false;
                state.createSession.error = null;

                console.log("Reading session created:", payload);
            })

            // get latest session
            .addCase(getLatestSession.pending, (state) => {
                state.latestSession.loading = true;
                state.latestSession.error = null;
            })
            .addCase(getLatestSession.fulfilled, (state, { payload }) => {
                state.latestSession.loading = false;
                state.latestSession.error = null;
                state.latestSession.data = payload.data && payload.data.length > 0 ? payload.data[0] : null;

                console.log("Get latest session success:", payload);
            })

            // get longest strike
            .addCase(getLongestStrike.pending, (state) => {
                console.log('Get longest strike');
                state.longestStrike.loading = true;
                state.longestStrike.error = null;
            })
            .addCase(getLongestStrike.fulfilled, (state, { payload }) => {
                console.log('Get longest strike success:', payload);
                state.longestStrike.loading = false;
                state.longestStrike.error = null;
                state.longestStrike.data = payload;
            })
            .addCase(getLongestStrike.rejected, (state, { error }) => {
                state.longestStrike.loading = false;
                state.longestStrike.error = error;
            })

            // get failed strike
            .addCase(getFailedStrike.pending, (state) => {
                console.log('Get failed strike');
                state.failedStrike.loading = true;
                state.failedStrike.error = null;
            })
            .addCase(getFailedStrike.fulfilled, (state, { payload }) => {
                console.log('Get failed strike success:', payload);
                state.failedStrike.loading = false;
                state.failedStrike.error = null;
                state.failedStrike.data = payload;
            })
            .addCase(getFailedStrike.rejected, (state, { error }) => {
                state.failedStrike.loading = false;
                state.failedStrike.error = error;
            })

            .addCase(supabaseCreateReadingSession.fulfilled, (state, { payload }) => {
                // calculate strike
                const secondsRead = payload.seconds_read;
                const dailyTargetSeconds = payload.daily_target_seconds;
                const strike = secondsRead / dailyTargetSeconds;
                
                if (state.longestStrike.data) {
                    state.longestStrike.data.total_strikes = Math.round(state.longestStrike.data.total_strikes + strike);
                }

                // update goal progress
                if (state.goal.data) {
                    state.goal.data.secondsRead = (state.goal.data.secondsRead + state.goal.data.manuallyAddedSeconds) + payload.seconds_read;
                }
            })
    }
});

export default userSlice.reducer;