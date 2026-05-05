import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  exchangeTokenAPI,
  getUserProfileAPI,
  refreshTokenAPI,
  revokeTokenAPI,
  supabaseSignInWithEmailAPI,
  supabaseSignOutAPI,
  supabaseSignUpWithEmailAPI,
} from './authAPI';

export const exchangeToken = createAsyncThunk(
  'auth/exchangeToken',
  async (payload: any) => {
    return await exchangeTokenAPI(payload);
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async () => {
    return await getUserProfileAPI();
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      return await refreshTokenAPI(refreshToken);
    } catch {
      try {
        return await refreshTokenAPI(refreshToken);
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  }
);

export const revokeToken = createAsyncThunk(
  'auth/revokeToken',
  async (_, { getState, rejectWithValue }) => {
    const state: any = getState();
    const refreshToken = state.auth.refreshToken;

    try {
      return await revokeTokenAPI(refreshToken);
    } catch {
      try {
        return await revokeTokenAPI(refreshToken);
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  }
);

export const supabaseSignUpWithEmail = createAsyncThunk(
  'auth/supabaseSignUpWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await supabaseSignUpWithEmailAPI(email, password);
      return result;
    } 
    catch (err: any) {
      const code = err.code || "UNKNOWN_ERROR";
      if (code === 'user_already_exists') {
        console.log("User already exists, attempting to sign in...");
        return await supabaseSignInWithEmailAPI(email, password);
      }

      return rejectWithValue(err.message);
    }
  }
);

export const supabaseSignInWithEmail = createAsyncThunk(
  'auth/supabaseSignInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await supabaseSignInWithEmailAPI(email, password);
      return result;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const supabaseSignOut = createAsyncThunk(
  'auth/supabaseSignOut',
  async (_, { rejectWithValue }) => {
    try {
      await supabaseSignOutAPI();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);