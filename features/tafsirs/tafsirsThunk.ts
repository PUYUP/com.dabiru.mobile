import { createAsyncThunk } from "@reduxjs/toolkit";
import { addNotesAPI, createGoalAPI, getTafsirsAPI, getUthmaniTajweedWithKeyAPI, getVerseByKeyAPI, getVerseByRangeAPI, supabaseExplainingTafsirAPI, supabaseSummarizeTafsirAPI } from "./tafsirsAPI";
import { CreateGoalPayload, GetRangeQuery, GetVerseQuery, TafsirSummarizerPayload } from "./tafsirsTyping";

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

// get verse by range
export const getVerseByRange = createAsyncThunk(
    'tafsirs/getVerseByRange',
    async (payload: { query: GetRangeQuery }) => {
        return await getVerseByRangeAPI(payload.query);
    }
);

// summarizing
export const summarizing = createAsyncThunk(
    'tafsirs/summarizing',
    async (payload: TafsirSummarizerPayload) => {
        return await supabaseSummarizeTafsirAPI(payload);
    }
);

// explaining
export const explaining = createAsyncThunk(
    'tafsirs/explaining',
    async (payload: TafsirSummarizerPayload) => {
        return await supabaseExplainingTafsirAPI(payload);
    }
);

// add notes
export const addNotes = createAsyncThunk(
    'tafsirs/addNotes',
    async (payload: { body: string, ranges: string[] }) => {
        return await addNotesAPI(payload.body, payload.ranges);
    }
);