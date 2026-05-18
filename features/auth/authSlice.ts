import { createSlice, SerializedError } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';
import { exchangeToken, getUserProfile, refreshToken, revokeToken, supabaseSignInWithEmail, supabaseSignUpWithEmail } from './authThunks';

const initialState = {
  user: {
    data: null,
    loading: false,
    error: null as SerializedError | null,
  },
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  selectedLanguage: null,
  supabase: {
    user: null as User | null,
    session: null as Session | null,
  }
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
            .addCase(getUserProfile.pending, (state) => {
                console.log("Fetching user profile...");
                state.user.loading = true;
                state.user.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, { payload }) => {
                console.log("User profile fetched success!");
                state.user.data = payload;
                state.user.loading = false;
                state.user.error = null;
            })
            .addCase(getUserProfile.rejected, (state, { error }) => {
                state.user.loading = false;
                state.user.error = error;
            })
            
            // supabase sign-up with email
            .addCase(supabaseSignUpWithEmail.pending, () => {
                console.log("Signing up with email...");
            })
            .addCase(supabaseSignUpWithEmail.fulfilled, (state, action) => {
                state.supabase.user = action.payload.user;
                state.supabase.session = action.payload.session;
            })
            .addCase(supabaseSignUpWithEmail.rejected, (state, action) => {
                console.log("Supabase sign-up failed:", action.payload);
            })

            // supabase sign-in with email
            .addCase(supabaseSignInWithEmail.pending, () => {
                console.log("Signing in with email...");
            })
            .addCase(supabaseSignInWithEmail.fulfilled, (state, action) => {
                state.supabase.user = action.payload.user;
                state.supabase.session = action.payload.session;
            })
            .addCase(supabaseSignInWithEmail.rejected, (state, action) => {
                console.log("Supabase sign-in failed:", action.payload);
            });
    },
});

export const { clearSession, setLanguageSelected, setTokens, revokeTokens } = authSlice.actions;
export default authSlice.reducer;