import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { getAllChapters, supabaseCreateReadingSession, supabaseGetLatestEndedSession, supabaseGetLatestSession } from "./readingThunk";

const initialState = {
    supabaseCreateSession: {
        data: null,
        loading: false,
        error: null as SerializedError | null,
    },
    supabaseLatestSession: {
        data: null,
        loading: false,
        hasFetched: false,
        error: null as SerializedError | null,
    },
    supabaseLatestEndedSession: {
        data: null,
        loading: false,
        hasFetched: false,
        error: null as SerializedError | null,
    },
    chapters: {
        data: [],
        loading: false,
        error: null as SerializedError | null,
    }
}

const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    resetCreateSession: (state) => {
        state.supabaseCreateSession = { data: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
        // create reading session
        .addCase(supabaseCreateReadingSession.pending, (state, action) => {
            console.log('Supabase create reading session...');

            state.supabaseCreateSession.loading = true;
            state.supabaseCreateSession.error = null;
        })
        .addCase(supabaseCreateReadingSession.fulfilled, (state, { payload }) => {
            console.log('Supabase create reading session success!');

            const isEnded = payload.status === 'ended';

            state.supabaseLatestSession.data = isEnded ? null : payload;
            state.supabaseCreateSession.data = payload;
            state.supabaseCreateSession.loading = false;
            state.supabaseCreateSession.error = null;
        })
        .addCase(supabaseCreateReadingSession.rejected, (state, { error }) => {
            state.supabaseCreateSession.loading = false;
            state.supabaseCreateSession.error = error;
        })

        // get latest session
        .addCase(supabaseGetLatestSession.pending, (state) => {
            console.log('Supabase get latest session...');
            state.supabaseLatestSession.loading = true;
            state.supabaseLatestSession.error = null;
            state.supabaseLatestSession.hasFetched = false;
        })
        .addCase(supabaseGetLatestSession.fulfilled, (state, { payload }) => {
            console.log('Supabase get latest session success!');
            state.supabaseLatestSession.loading = false;
            state.supabaseLatestSession.hasFetched = true;
            state.supabaseLatestSession.error = null;
            state.supabaseLatestSession.data = payload;
        })
        .addCase(supabaseGetLatestSession.rejected, (state, { error }) => {
            state.supabaseLatestSession.loading = false;
            state.supabaseLatestSession.error = error;
        })

        // get latest ended session
        .addCase(supabaseGetLatestEndedSession.pending, (state) => {
            console.log('Supabase get latest Ended session...');
            state.supabaseLatestEndedSession.loading = true;
            state.supabaseLatestEndedSession.error = null;
            state.supabaseLatestEndedSession.hasFetched = false;
        })
        .addCase(supabaseGetLatestEndedSession.fulfilled, (state, { payload }) => {
            console.log('Supabase get latest Ended session success!');
            state.supabaseLatestEndedSession.loading = false;
            state.supabaseLatestEndedSession.hasFetched = true;
            state.supabaseLatestEndedSession.error = null;
            state.supabaseLatestEndedSession.data = payload;
        })
        .addCase(supabaseGetLatestEndedSession.rejected, (state, { error }) => {
            state.supabaseLatestEndedSession.loading = false;
            state.supabaseLatestEndedSession.error = error;
        })

        // get all chapters
        .addCase(getAllChapters.pending, (state) => {
            console.log('Getting all chapters...');
            state.chapters.loading = true;
            state.chapters.error = null;
        })
        .addCase(getAllChapters.fulfilled, (state, { payload }) => {
            console.log('Getting all chapters success!');
            state.chapters.loading = false;
            state.chapters.error = null;
            state.chapters.data = payload.chapters;
        })
        .addCase(getAllChapters.rejected, (state, { error }) => {
            state.chapters.loading = false;
            state.chapters.error = error;
        })
    }
});

export const { resetCreateSession } = readingSlice.actions;
export default readingSlice.reducer;