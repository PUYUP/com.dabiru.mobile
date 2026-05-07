import { createAsyncThunk } from "@reduxjs/toolkit";
import { bulkUpdateConfigAPI, getConfigAPI, getLanguagesAPI, getTranslationsAPI, updateConfigAPI } from "./configAPI";
import { UpdateConfigPayload } from "./configTyping";

// get the config
export const getConfig = createAsyncThunk(
  'config/getConfig',
  async () => {
    return await getConfigAPI();
  }
);

// update single config
export const updateConfig = createAsyncThunk(
  'config/updateConfig',
  async (payload: UpdateConfigPayload) => {
    console.log("updateConfig thunk called with payload:", payload); // Debug log
    return await updateConfigAPI(payload);
  }
);

// update bulk config
// full payload available here: https://api-docs.quran.foundation/docs/user_related_apis_versioned/1.0.0/bulk-add-or-update-preferences/
export const bulkUpdateConfig = createAsyncThunk(
  'config/bulkUpdateConfig',
  async (payload: any) => {
    console.log("Update bulk config thunk called with payload:", payload); // Debug log
    return await bulkUpdateConfigAPI(payload);
  }
);

// get languages
export const getLanguages = createAsyncThunk(
  'config/getLanguages',
  async () => {
    return await getLanguagesAPI();
  }
);

// get translations
export const getTranslations = createAsyncThunk(
  'config/getTranslations',
  async () => {
    return await getTranslationsAPI();
  }
);
