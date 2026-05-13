import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllChaptersAPI, supabaseCreateReadingSessionAPI, supabaseGetLatestEndedSessionAPI, supabaseGetLatestSessionAPI } from "./readingAPI";
import { CreateReadingSessionPayload, GetLatestSessionQuery } from "./readingTyping";

// create session
export const supabaseCreateReadingSession = createAsyncThunk(
  'reading/supabaseCreateReadingSession',
  async (payload: { data: CreateReadingSessionPayload, purpose?: string}) => {
    return await supabaseCreateReadingSessionAPI(payload.data);
  }
);

// get latest session
export const supabaseGetLatestSession = createAsyncThunk(
  'reading/supabaseGetLatestSession',
  async (payload: GetLatestSessionQuery) => {
    return await supabaseGetLatestSessionAPI(payload);
  }
);

// get latest ended session
export const supabaseGetLatestEndedSession = createAsyncThunk(
  'reading/supabaseGetLatestEndedSession',
  async (payload: GetLatestSessionQuery) => {
    return await supabaseGetLatestEndedSessionAPI(payload);
  }
);

// get all chapters
export const getAllChapters = createAsyncThunk(
  'reading/getAllChapters',
  async () => {
    return await getAllChaptersAPI();
  }
);