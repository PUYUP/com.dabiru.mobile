// services/tokenProvider.ts
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let onTokenRefreshed: ((accessToken: string, refreshToken: string) => void) | null = null;
let onTokenRevoked: (() => void) | null = null;

export const setTokenGetter = (fn: () => string | null) => {
  getAccessToken = fn;
};

export const setRefreshTokenGetter = (fn: () => string | null) => {
  getRefreshToken = fn;
};

export const setOnTokenRefreshed = (fn: (accessToken: string, refreshToken: string) => void) => {
  onTokenRefreshed = fn;
};

export const setOnTokenRevoked = (fn: () => void) => {
  onTokenRevoked = fn;
};

export { getAccessToken, getRefreshToken, onTokenRefreshed, onTokenRevoked };
