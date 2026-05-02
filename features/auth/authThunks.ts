import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  exchangeTokenAPI,
  getUserProfileAPI,
  refreshTokenAPI,
  revokeTokenAPI,
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