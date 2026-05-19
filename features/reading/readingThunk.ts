import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllChaptersAPI, pagesLookupAPI, supabaseCreateReadingSessionAPI, supabaseGetLatestEndedSessionAPI, supabaseGetLatestSessionAPI, supabaseGetSessionAPI, supabaseGetTafsirsAPI, supabaseUpdateReadingSessionAPI } from "./readingAPI";
import { CreateReadingSessionPayload, GetLatestSessionQuery, GetSessionQuery, GetTafsirQuery, PagesLookupQuery, UpdateReadingSessionPayload } from "./readingTyping";

// create session
export const supabaseCreateReadingSession = createAsyncThunk(
  'reading/supabaseCreateReadingSession',
  async (payload: { data: CreateReadingSessionPayload, purpose?: string}) => {
    return await supabaseCreateReadingSessionAPI(payload.data);
  }
);

// update session
export const supabaseUpdateReadingSession = createAsyncThunk(
  'reading/supabaseUpdateReadingSession',
  async (payload: { data: UpdateReadingSessionPayload, id: string}) => {
    return await supabaseUpdateReadingSessionAPI(payload.data, payload.id);
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

// get sessions
export const supabaseGetSessions = createAsyncThunk(
  'reading/supabaseGetSessions',
  async (payload: GetSessionQuery) => {
    return await supabaseGetSessionAPI(payload);
  }
);

// get child sessions
export const supabaseGetChildSessions = createAsyncThunk(
  'reading/supabaseGetChildSessions',
  async (payload: GetSessionQuery) => {
    return await supabaseGetSessionAPI(payload);
  }
);

// get session
export const supabaseGetSession = createAsyncThunk(
  'reading/supabaseGetSession',
  async (payload: GetSessionQuery) => {
    return await supabaseGetSessionAPI(payload);
  }
);

// get all chapters
export const getAllChapters = createAsyncThunk(
  'reading/getAllChapters',
  async () => {
    return await getAllChaptersAPI();
  }
);

// get tafsirs
export const supabaseGetTafsirs = createAsyncThunk(
  'reading/supabaseGetTafsirs',
  async (payload: GetTafsirQuery) => {
    return await supabaseGetTafsirsAPI(payload);
  }
);

// get next verse from tafsirs
export const supabaseGetNextVerse = createAsyncThunk(
  'reading/supabaseGetNextVerse',
  async (payload: GetTafsirQuery) => {
    return await supabaseGetTafsirsAPI(payload);
  }
);

// pages lookup
export const pagesLookup = createAsyncThunk(
  'reading/pagesLookup',
  async (payload: PagesLookupQuery) => {
    return await pagesLookupAPI(payload);
  }
);