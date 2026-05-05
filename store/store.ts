import { setTokens } from '@/features/auth/authSlice';
import { revokeToken } from '@/features/auth/authThunks';
import tafsirsReducer from '@/features/tafsirs/tafsirsSlice';
import userReducer from '@/features/user/userSlice';
import { setOnTokenRefreshed, setOnTokenRevoked, setRefreshTokenGetter, setTokenGetter } from '@/services/tokenProvider';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { authPersistedReducer } from './authStorage';
import { configPersistedReducer } from './configStorage';

export const store = configureStore({
  reducer: {
    auth: authPersistedReducer,
    user: userReducer,
    config: configPersistedReducer,
    tafsirs: tafsirsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Setup token provider with Redux store
setTokenGetter(() => store.getState().auth.accessToken);
setRefreshTokenGetter(() => store.getState().auth.refreshToken);

setOnTokenRefreshed((accessToken, refreshToken) => {
  store.dispatch(setTokens({ accessToken, refreshToken }));
});

setOnTokenRevoked(() => {
  store.dispatch(revokeToken());
});