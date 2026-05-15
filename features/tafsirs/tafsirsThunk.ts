import { createAsyncThunk } from "@reduxjs/toolkit";
import { createGoalAPI, getTafsirsAPI, getUthmaniTajweedWithKeyAPI, getVerseByKeyAPI, supabaseSummarizeTafsirAPI } from "./tafsirsAPI";
import { CreateGoalPayload, GetVerseQuery, TafsirSummarizerPayload } from "./tafsirsTyping";

export const getTafsirs = createAsyncThunk(
    'tafsirs/getTafsirs',
    async (payload: string) => {
        return await getTafsirsAPI(payload);
    }
);

// create a goal
export const createGoal = createAsyncThunk(
    'tafsirs/createGoal',
    async (payload: CreateGoalPayload) => {
        return await createGoalAPI(payload);
    }
);

// get Uthmani Tajweed with key
export const getUthmaniTajweedWithKey = createAsyncThunk(
    'tafsirs/getUthmaniTajweedWithKey',
    async (payload: string) => {
        return await getUthmaniTajweedWithKeyAPI(payload);
    }
);

// get verse by key
export const getVerseByKey = createAsyncThunk(
    'tafsirs/getVerseByKey',
    async (payload: { verseKey: string, query: GetVerseQuery }) => {
        return await getVerseByKeyAPI(payload.verseKey, payload.query);
    }
);

// summarizing
export const summarizing = createAsyncThunk(
    'tafsirs/summarizing',
    async (payload: TafsirSummarizerPayload) => {
        return await supabaseSummarizeTafsirAPI(payload);
    }
);