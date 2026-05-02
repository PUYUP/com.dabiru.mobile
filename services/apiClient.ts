// services/apiClient.ts
import { refreshToken, revokeToken } from '@/features/auth/authThunks';
import { store } from '@/store/store';
import axios from 'axios';

import {
  getRefreshing,
  notifySubscribers,
  setRefreshing,
  subscribeTokenRefresh,
} from './refreshManager';

const USE_PRELIVE = true;
const baseUrl = USE_PRELIVE
  ? "https://apis-prelive.quran.foundation"
  : "https://apis.quran.foundation";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers['X-Auth-Token'] = token;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const state = store.getState();

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // kalau sudah pernah retry → stop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 🔥 kalau lagi refresh → masuk queue
    if (getRefreshing()) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers['X-Auth-Token'] = newToken;
          resolve(api(originalRequest));
        });
      });
    }

    // 🔥 mulai refresh
    setRefreshing(true);

    if (!state.auth.refreshToken) {
      setRefreshing(false);
      store.dispatch(revokeToken());
      return Promise.reject(error);
    }

    try {
      const result = await store.dispatch(
        refreshToken(state.auth.refreshToken)
      ).unwrap();

      const newToken = result.access_token;

      // update semua request yang nunggu
      notifySubscribers(newToken);

      setRefreshing(false);

      // retry request awal
      originalRequest.headers['X-Auth-Token'] = newToken;
      return api(originalRequest);
    } catch (err) {
      setRefreshing(false);

      // fail semua subscriber (optional: bisa reject semua)
      notifySubscribers('');

      store.dispatch(revokeToken());
      return Promise.reject(err);
    }
  }
);

export default api;