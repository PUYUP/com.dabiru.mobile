import { createAsyncThunk } from "@reduxjs/toolkit";
import { addActivityAPI, createGoalAPI, getGoalAPI, updateGoalAPI } from "./userAPI";
import { ActivityPayload, GoalPayload } from "./userTyping";

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