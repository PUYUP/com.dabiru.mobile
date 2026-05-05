import { createAsyncThunk } from "@reduxjs/toolkit";
import { createGoalAPI } from "./tafsirsAPI";
import { CreateGoalPayload } from "./tafsirsTyping";

export const createGoal = createAsyncThunk(
    'tafsirs/createGoal',
    async (payload: CreateGoalPayload) => {
        return await createGoalAPI(payload);
    }
);