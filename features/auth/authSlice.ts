import { createSlice } from '@reduxjs/toolkit';
import { exchangeToken, getUserProfile, refreshToken, revokeToken } from './authThunks';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  selectedLanguage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSession: () => initialState,
    setLanguageSelected: (state, { payload }) => {
        state.selectedLanguage = payload;
    },
    setTokens(state, { payload }) {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    revokeTokens(state) {
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
        builder
            // exchange token
            .addCase(exchangeToken.pending, (state) => {
                console.log("Exchanging token...");
            })
            .addCase(exchangeToken.fulfilled, (state, action) => {
                state.accessToken = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
                state.isAuthenticated = true;
            })
            
            // refresh token
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.accessToken = action.payload.access_token;
            })
            .addCase(refreshToken.rejected, () => initialState)

            // revoke token
            .addCase(revokeToken.fulfilled, () => {
                return initialState;
            })
            .addCase(revokeToken.rejected, () => {
                return initialState;
            })
            
            // get user profile
            .addCase(getUserProfile.pending, () => {
                console.log("Fetching user profile...");
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                console.log("User profile fetched:", action.payload);
                state.user = action.payload;
            })
            .addCase(getUserProfile.rejected, () => initialState)
            
    },
});

export const { clearSession, setLanguageSelected, setTokens, revokeTokens } = authSlice.actions;
export default authSlice.reducer;