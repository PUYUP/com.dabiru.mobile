import { createAsyncThunk } from "@reduxjs/toolkit";
import { getConfigAPI, updateConfigAPI } from "./configAPI";
import { UpdateConfigPayload } from "./configTyping";

export const getConfig = createAsyncThunk(
  'config/getConfig',
  async () => {
    return await getConfigAPI();
  }
);

export const updateConfig = createAsyncThunk(
  'config/updateConfig',
  async (payload: UpdateConfigPayload) => {
    console.log("updateConfig thunk called with payload:", payload); // Debug log
    return await updateConfigAPI(payload);
  }
);
