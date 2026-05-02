import configReducer from '@/features/config/configSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'config',
  storage: AsyncStorage,
  whitelist: [
    'theme',
    'reading',
    'quranReaderStyles',
    'translations',
    'tafsirs',
    'audio',
    'language',
    'userHasCustomised',
  ],
};

export const configPersistedReducer = persistReducer(persistConfig, configReducer);