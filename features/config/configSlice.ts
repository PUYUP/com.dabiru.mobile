import { createSlice } from "@reduxjs/toolkit";
import { getConfig, updateConfig } from "./configThunks";
import { AppConfig } from "./configTyping";

export const initialState: AppConfig = {
  theme: {
    type: "auto",
  },
  reading: {
    readingPreference: "tafsirs",
    selectedWordByWordLocale: "en",
    wordClickFunctionality: "play-audio",
    isReadingByRevelationOrder: true,
    wordByWordContentType: ["translation"],
    wordByWordDisplay: ["tooltip"],
    wordByWordTooltipContentType: ["translation"],
    wordByWordInlineContentType: [],
    selectedReadingTranslation: "131",
    selectedReflectionLanguages: ["string"],
    selectedLessonLanguages: ["string"],
  },
  quranReaderStyles: {
    tafsirFontScale: 3,
    quranTextFontScale: 3,
    translationFontScale: 3,
    wordByWordFontScale: 3,
    reflectionFontScale: 3,
    qnaFontScale: 3,
    lessonFontScale: 3,
    surahInfoFontScale: 3,
    hadithFontScale: 3,
    layersFontScale: 3,
    quranFont: "code_v1",
    mushafLines: "16_lines",
    showTajweedRules: true,
  },
  translations: {
    selectedTranslations: [131],
  },
  tafsirs: {
    selectedTafsirs: ["en-tafisr-ibn-kathir"],
  },
  audio: {
    reciter: 7,
    playbackRate: 1,
    showTooltipWhenPlayingAudio: true,
    enableAutoScrolling: true,
  },
  language: {
    language: null,
  },
  userHasCustomised: {
    userHasCustomised: false,
  },
};

// slices
const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    resetConfig: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // clear config on logout
      .addCase('auth/revokeToken/fulfilled', () => {
        console.log("Logout successful, resetting config to initial state.");
        return initialState;
      })
      .addCase('auth/revokeToken/rejected', () => {
        return initialState;
      })
      // get config
      .addCase(getConfig.pending, (state) => {
        console.log("Fetching config...");
      })
      .addCase(getConfig.fulfilled, (state, { payload }) => {
        state = { ...state, ...payload };
        return state;
      })

      // update config
      .addCase(updateConfig.pending, (state, { meta }) => {
        console.log("Updating config...");

        const { group, key, value } = meta.arg;
        const g = group as keyof AppConfig;

        return {
          ...state,
          [g]: {
            ...(state[g] as Record<string, unknown>),
            [key]: value,
          },
        };
      })
      .addCase(updateConfig.fulfilled, (state, { payload }) => {
        console.log("Config updated successfully:", payload.data);
        const { group, key, value } = payload.data;
        const g = group as keyof AppConfig;

        return {
          ...state,
          [g]: {
            ...(state[g] as Record<string, unknown>),
            [key]: value,
          },
        };
      });
  },
});

export const { resetConfig } = configSlice.actions;
export default configSlice.reducer;