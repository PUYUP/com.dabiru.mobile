// services/tokenProvider.ts
let getToken: () => string | null = () => null;

export const setTokenGetter = (fn: () => string | null) => {
  getToken = fn;
};

export const getAccessToken = () => getToken();