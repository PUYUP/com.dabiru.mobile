// services/refreshManager.ts
type Subscriber = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let subscribers: Subscriber[] = [];

export const getRefreshing = () => isRefreshing;
export const setRefreshing = (val: boolean) => { isRefreshing = val; };

export const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (err: unknown) => void
) => {
  subscribers.push({ resolve, reject });
};

export const notifySubscribers = (token: string) => {
  subscribers.forEach((s) => s.resolve(token));
  subscribers = [];
};

export const rejectSubscribers = (err: unknown) => {
  subscribers.forEach((s) => s.reject(err));
  subscribers = [];
};