import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { bulkUpdateConfig, getConfig, getLanguages, getTafsirs, getTranslations, updateConfig } from "./configThunks";
import { AppConfig } from "./configTyping";

export const initialState: { preferences: AppConfig, languages: any, translations: any, tafsirs: any } = {
  preferences: {
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
  },
  languages: {
    data: null,
    loading: false,
    error: null as SerializedError | null,
  },
  translations: {
    data: null,
    loading: false,
    error: null as SerializedError | null,
  },
  tafsirs: {
    data: null,
    loading: false,
    error: null as SerializedError | null,
  }
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
        console.log("Fecting config success:", payload);
        state.preferences = {
          ...state.preferences,
          ...payload,
        }
      })

      // update config
      .addCase(updateConfig.pending, (state, { meta }) => {
        console.log("Updating config...");

        const { group, key, value } = meta.arg;
        const g = group as keyof AppConfig;

        state.preferences = {
          ...state.preferences,
          [g]: {
            ...(state.preferences[g] as Record<string, unknown>),
            [key]: value,
          },
        }
      })
      .addCase(updateConfig.fulfilled, (state, { payload }) => {
        console.log("Config updated successfully:", payload.data);
        const { group, key, value } = payload.data;
        const g = group as keyof AppConfig;

        state.preferences = {
          ...state.preferences,
          [g]: {
            ...(state.preferences[g] as Record<string, unknown>),
            [key]: value,
          },
        }
      })
      
      // bulk update config
      .addCase(bulkUpdateConfig.pending, (state, { meta }) => {
        console.log('Bulk updating config...');
        const arg = meta.arg;

        state.preferences = {
          ...state.preferences,
          ...arg,
        }
      })
      .addCase(bulkUpdateConfig.fulfilled, (state, { payload }) => {
        console.log('Bulk update config success:', payload);
      })
      .addCase(bulkUpdateConfig.rejected, (state, { error }) => {
        console.log('Bulk update config failed:', error);
      })

      // get languages
      .addCase(getLanguages.pending, (state, { meta }) => {
        console.log('Get languages...');
        state.languages.loading = true;
        state.languages.error = null;
      })
      .addCase(getLanguages.fulfilled, (state, { payload }) => {
        console.log('Get languages succcess!');
        state.languages.loading = false;
        state.languages.error = null;
        state.languages.data = payload.languages;
      })
      .addCase(getLanguages.rejected, (state, { error }) => {
        state.languages.loading = false;
        state.languages.error = error;
      })

      // get translations
      .addCase(getTranslations.pending, (state, { meta }) => {
        console.log('Get translations...');
        state.translations.loading = true;
        state.translations.error = null;
      })
      .addCase(getTranslations.fulfilled, (state, { payload }) => {
        console.log('Get translations succcess!');
        state.translations.loading = false;
        state.translations.error = null;
        state.translations.data = payload.translations;
      })
      .addCase(getTranslations.rejected, (state, { error }) => {
        state.translations.loading = false;
        state.translations.error = error;
      })

      // get tafsirs
      .addCase(getTafsirs.pending, (state, { meta }) => {
        console.log('Get tafsirs...');
        state.tafsirs.loading = true;
        state.tafsirs.error = null;
      })
      .addCase(getTafsirs.fulfilled, (state, { payload }) => {
        console.log('Get tafsirs succcess!');
        state.tafsirs.loading = false;
        state.tafsirs.error = null;
        state.tafsirs.data = payload.tafsirs;
      })
      .addCase(getTafsirs.rejected, (state, { error }) => {
        state.tafsirs.loading = false;
        state.tafsirs.error = error;
      })
  },
});

export const { resetConfig } = configSlice.actions;
export default configSlice.reducer;