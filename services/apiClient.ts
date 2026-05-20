// services/apiClient.ts
import axios from 'axios';

import { QF_CLIENT_ID, QF_USE_PRELIVE } from "@/constants/oauth";
import {
  getRefreshing,
  notifySubscribers,
  rejectSubscribers,
  setRefreshing,
  subscribeTokenRefresh,
} from './refreshManager';
import {
  getAccessToken,
  getRefreshToken,
  onTokenRefreshed,
  onTokenRevoked,
} from './tokenProvider';

const baseUrl = QF_USE_PRELIVE
  ? 'https://apis-prelive.quran.foundation'
  : 'https://apis.quran.foundation';

const api = axios.create({ baseURL: baseUrl });

// ✅ Request interceptor — inject token
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  config.headers['X-Client-Id'] = QF_CLIENT_ID;
  
  if (token) {
    config.headers['X-Auth-Token'] = token;
  }

  return config;
});

// ✅ Response interceptor — handle 401 + auto refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 🔥 Kalau sedang refresh → masuk queue, tunggu token baru
    if (getRefreshing()) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken) => {
            originalRequest.headers['X-Auth-Token'] = newToken;
            resolve(api(originalRequest));
          },
          (err) => reject(err),
        );
      });
    }

    const currentRefreshToken = getRefreshToken();

    // Tidak ada refresh token → langsung revoke
    if (!currentRefreshToken) {
      onTokenRevoked?.();
      return Promise.reject(error);
    }

    setRefreshing(true);

    try {
      console.log('Refresing token...');
      
      // 🔥 Hit endpoint refresh token
      const { data } = await axios.post(
        `${baseUrl}/auth/v1/token/refresh`,
        { refresh_token: currentRefreshToken },
      );

      const newAccessToken: string = data.access_token;
      const newRefreshToken: string = data.refresh_token;

      // Simpan token baru ke store / AsyncStorage via callback
      onTokenRefreshed?.(newAccessToken, newRefreshToken);

      // Beritahu semua request yang antri
      notifySubscribers(newAccessToken);

      // Retry request awal
      originalRequest.headers['X-Auth-Token'] = newAccessToken;
      return api(originalRequest);
    } catch (err) {
      rejectSubscribers(err);
      onTokenRevoked?.();
      return Promise.reject(err);
    } finally {
      setRefreshing(false);
    }
  },
);

export default api;