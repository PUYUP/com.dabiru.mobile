import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";

import { QF_CLIENT_ID, QF_USE_PRELIVE } from "@/constants/oauth";
import { exchangeToken, getUserProfile, revokeToken, supabaseSignOut, supabaseSignUpWithEmail } from "@/features/auth/authThunks";
import { getConfig } from "@/features/config/configThunks";
import { useAppDispatch } from '@/hooks/redux-hooks';
import { jwtDecode } from "jwt-decode";

WebBrowser.maybeCompleteAuthSession();

const authBaseUrl = QF_USE_PRELIVE
  ? "https://prelive-oauth2.quran.foundation"
  : "https://oauth2.quran.foundation";

const discovery = {
  authorizationEndpoint: `${authBaseUrl}/oauth2/auth`,
  tokenEndpoint: `${authBaseUrl}/oauth2/token`,
  revocationEndpoint: `${authBaseUrl}/oauth2/revoke`,
};

export function useQFAuth() {
  const dispatch = useAppDispatch();
  const redirectURI = makeRedirectUri({ 
    scheme: 'comdabirutafsir',
    path: '(onboarding)/choose-language',
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: QF_CLIENT_ID,
      scopes: [
        "openid",
        "offline_access",
        "content", 
        "goal", 
        "reading_session", 
        "streak", 
        "user", 
        "preference",
        "user",
        "activity_day",
        "note",
      ],
      redirectUri: redirectURI,
      usePKCE: true,
    },
    discovery
  );

  React.useEffect(() => {
    if (!response || response.type !== "success" || !request?.codeVerifier) {
      return;
    }

    const run = async () => {
      try {
        const token = await (dispatch(
          exchangeToken({
            code: response.params.code,
            codeVerifier: request.codeVerifier,
            redirectUri: redirectURI,
          }) as any
        )).unwrap();

        // call another thunk to fetch user profile after successful login
        dispatch(getUserProfile(token.access_token) as any);
        dispatch(getConfig() as any); // Fetch config after login

        const idToken = token.id_token;
        if (idToken) {
          const profile = jwtDecode(idToken) as any;
          const email = profile.email;
          const sub = profile.sub; // equal to profile id
          
          // signup to supabase
          await dispatch(supabaseSignUpWithEmail({ email, password: sub }) as any);
        }

      } catch (err) {
        console.log("Login failed:", err);
      }
    };

    run();
  }, [response]);

  const logout = async () => {
    try {
      dispatch(revokeToken() as any);
      dispatch(supabaseSignOut() as any);
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return {
    login: () => promptAsync(),
    isReady: !!request,
    logout,
  };
}