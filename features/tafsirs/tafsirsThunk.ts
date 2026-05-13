import { createAsyncThunk } from "@reduxjs/toolkit";
import { createGoalAPI, getTafsirsAPI, getUthmaniTajweedWithKeyAPI, getVerseByIdAPI, getVerseByKeyAPI } from "./tafsirsAPI";
import { CreateGoalPayload, GetVerseQuery } from "./tafsirsTyping";

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

// get verse by id
export const getVerseById = createAsyncThunk(
    'tafsirs/getVerseById',
    async (payload: { verseId: string, query: GetVerseQuery }) => {
        return await getVerseByIdAPI(payload.verseId, payload.query);
    }
);