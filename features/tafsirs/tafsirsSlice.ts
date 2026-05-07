import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { createGoal, getTafsirs, getUthmaniTajweedWithKey, getVerseByKey } from "./tafsirsThunk";
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
    }
};

const tafsirsSlice = createSlice({
    name: 'tafsirs',
    initialState,
    reducers: {},
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
                console.log(payload);
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
                const verses = payload.verses.map((item: any) => item.text_uthmani_tajweed);

                state.uthmaniTajweed.loading = false;
                state.uthmaniTajweed.error = null;
                state.uthmaniTajweed.data = verses.join(' ');
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
    },
});

export default tafsirsSlice.reducer;