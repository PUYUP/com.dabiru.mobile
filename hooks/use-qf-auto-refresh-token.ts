import { refreshToken } from '@/features/auth/authThunks';
import { getTokenExpiry } from '@/features/auth/tokenUtils';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux-hooks';

export function useQFAutoRefreshToken() {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken: rt } = useAppSelector((s: any) => s.auth);

  useEffect(() => {
    if (!accessToken || !rt) return;

    const exp = getTokenExpiry(accessToken);
    if (!exp) return;

    const timeout = exp - Date.now() - 60000;

    if (timeout <= 0) {
      dispatch(refreshToken(rt) as any);
      return;
    }

    const timer = setTimeout(() => {
      dispatch(refreshToken(rt) as any);
    }, timeout);

    return () => clearTimeout(timer);
  }, [accessToken, rt]);
}