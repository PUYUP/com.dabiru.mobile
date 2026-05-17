import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { createGoal, getTafsirs, getUthmaniTajweedWithKey, getVerseByKey, getVerseByRange, summarizing } from "./tafsirsThunk";
import { GoalResponse } from "./tafsirsTyping";

const initialState = {
    goals: [] as GoalResponse[],
    tafsirs: {
        data: [] as any[],
        loading: false,
        error: null as SerializedError | null,
    },
    uthmaniTajweed: {
        data: null,
        loading: false,
        error: null as SerializedError | null,
    },
    verse: {
        data: null,
        loading: false,
        error: null as SerializedError | null,
    },
    verses: {
        data: [] as any[],
        loading: false,
        error: null as SerializedError | null,
    },
    summary: {
        data: null as null,
        loading: false,
        error: null as SerializedError | null,
    },
};

const tafsirsSlice = createSlice({
    name: 'tafsirs',
    initialState,
    reducers: {
        resetSummary: (state) => {
            state.summary = initialState.summary;
        },
        resetVerse: (state) => {
            state.verse = initialState.verse;
            state.verses = initialState.verses;
        }
    },
    extraReducers: (builder) => {
        builder
            // get tafsirs
            .addCase(getTafsirs.pending, (state) => {
                console.log('Getting tafsirs...');
                state.tafsirs.loading = true;
                state.tafsirs.error = null;
            })
            .addCase(getTafsirs.fulfilled, (state, { payload }) => {
                console.log('Getting tafsirs success!');
                state.tafsirs.loading = false;
                state.tafsirs.error = null;
            })
            .addCase(getTafsirs.rejected, (state, { error }) => {
                console.log('Getting tafsirs failed:', error);
                state.tafsirs.loading = false;
                state.tafsirs.error = error;
            })

            // goal crud
            .addCase(createGoal.pending, () => {
                console.log("Creating goal...");
            })
            .addCase(createGoal.fulfilled, (state, { payload }) => {
                console.log("Goal created successfully:", payload);
            })
            .addCase(createGoal.rejected, (state, { payload }) => {
                console.log("Failed to create goal:", payload);
            })
            
            // get uthmani tajweed with key
            .addCase(getUthmaniTajweedWithKey.pending, (state) => {
                console.log('Getting uthmani tajweed with key...');
                state.uthmaniTajweed.loading = true;
                state.uthmaniTajweed.error = null;
            })
            .addCase(getUthmaniTajweedWithKey.fulfilled, (state, { payload }) => {
                state.uthmaniTajweed.loading = false;
                state.uthmaniTajweed.error = null;
                state.uthmaniTajweed.data = payload?.verses?.[0];
            })
            .addCase(getUthmaniTajweedWithKey.rejected, (state, { error }) => {
                state.uthmaniTajweed.loading = false;
                state.uthmaniTajweed.error = error;
            })

            // get verse by key
            .addCase(getVerseByKey.pending, (state) => {
                console.log('Getting verse by key...');
                state.verse.loading = true;
                state.verse.error = null;
            })
            .addCase(getVerseByKey.fulfilled, (state, { payload }) => {
                console.log('Getting verse by key success!');
                state.verse.loading = false;
                state.verse.error = null;
                state.verse.data = payload.verse;
            })
            .addCase(getVerseByKey.rejected, (state, { error }) => {
                console.log('Getting verse by key failure!');
                state.verse.loading = false;
                state.verse.error = error;
            })

            // get verse by range
            .addCase(getVerseByRange.pending, (state) => {
                console.log('Getting verse by Range...');
                state.verses.loading = true;
                state.verses.error = null;
            })
            .addCase(getVerseByRange.fulfilled, (state, { payload }) => {
                console.log('Getting verse by Range success!');
                state.verses.loading = false;
                state.verses.error = null;
                state.verses.data = payload.verses;
            })
            .addCase(getVerseByRange.rejected, (state, { error }) => {
                console.log('Getting verse by Range failure!');
                state.verses.loading = false;
                state.verses.error = error;
            })

            // summarizing
            .addCase(summarizing.pending, (state) => {
                console.log('Summarizing tafsirs...');
                state.summary.loading = true;
                state.summary.error = null;
            })
            .addCase(summarizing.fulfilled, (state, { payload }) => {
                console.log('Summarizing tafsirs success!');
                state.summary.data = payload;
                state.summary.loading = false;
                state.summary.error = null;
            })
            .addCase(summarizing.rejected, (state, { error }) => {
                console.log('Summarizing tafsirs failed:', error);
                state.summary.loading = false;
                state.summary.error = error;
            })
    },
});

export const { resetSummary, resetVerse } = tafsirsSlice.actions;
export default tafsirsSlice.reducer;