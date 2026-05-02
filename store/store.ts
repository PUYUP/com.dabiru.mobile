import { setTokenGetter } from '@/services/tokenProvider';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { authPersistedReducer } from './authStorage';
import { configPersistedReducer } from './configStorage';

export const store = configureStore({
  reducer: {
    auth: authPersistedReducer,
    config: configPersistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setTokenGetter(() => store.getState().auth.accessToken);
export const persistor = persistStore(store);