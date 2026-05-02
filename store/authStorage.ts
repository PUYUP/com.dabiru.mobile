import authReducer from '@/features/auth/authSlice';
import { persistReducer } from 'redux-persist';

import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: [
    'accessToken', 
    'refreshToken', 
    'user', 
    'isAuthenticated', 
    'selectedLanguage',
  ],
};

export const authPersistedReducer = persistReducer(persistConfig, authReducer);