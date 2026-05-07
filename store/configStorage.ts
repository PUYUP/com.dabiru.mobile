import configReducer from '@/features/config/configSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'config',
  storage: AsyncStorage,
  whitelist: [
    'preferences',
  ],
};

export const configPersistedReducer = persistReducer(persistConfig, configReducer);