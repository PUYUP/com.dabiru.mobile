// services/apiClient.ts
import { QF_CLIENT_ID } from '@/constants/oauth';
import axios from 'axios';
import { getAccessToken } from './tokenProvider';

const USE_PRELIVE = true;
const baseUrl = USE_PRELIVE
  ? "https://apis-prelive.quran.foundation"
  : "https://apis.quran.foundation";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  config.headers['X-Client-Id'] = QF_CLIENT_ID;

  if (token) {
    config.headers['X-Auth-Token'] = token;
  }

  return config;
});

export default api;