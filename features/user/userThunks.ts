import { createAsyncThunk } from "@reduxjs/toolkit";
import { addActivityAPI, createGoalAPI, createReadingSessionAPI, getActivityDaysAPI, getGoalAPI, updateGoalAPI } from "./userAPI";
import { ActivityDaysQuery, ActivityPayload, GoalPayload } from "./userTyping";

// create goal
export const createGoal = createAsyncThunk(
    'user/createGoal',
    async (payload: GoalPayload) => {
        return await createGoalAPI(payload);
    }
);

// update goal
export const updateGoal = createAsyncThunk(
    'user/updateGoal',
    async (payload: { data: GoalPayload, id: string }) => {
        return await updateGoalAPI(payload.data, payload.id);
    }
);

// get goal
export const getGoal = createAsyncThunk(
    'user/getGoal',
    async () => {
        return await getGoalAPI();
    }
);

// add activity
export const addActivity = createAsyncThunk(
    'user/addActivity',
    async (payload: ActivityPayload) => {
        return await addActivityAPI(payload);
    }
);

// get activity days
export const getActivityDays = createAsyncThunk(
    'user/getActivityDays',
    async (query: ActivityDaysQuery) => {
        return await getActivityDaysAPI(query);
    }
);

// create reading session
export const createReadingSession = createAsyncThunk(
    'user/createReadingSession',
    async (payload: { chapterNumber: number, verseNumber: number }) => {
        return await createReadingSessionAPI(payload.chapterNumber, payload.verseNumber);
    }
);