// services/refreshManager.ts

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

export const subscribeTokenRefresh = (cb: (token: string) => void) => {
  subscribers.push(cb);
};

export const notifySubscribers = (token: string) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

export const setRefreshing = (value: boolean) => {
  isRefreshing = value;
};

export const getRefreshing = () => isRefreshing;