export const QF_CLIENT_ID = "39a7ee38-6700-4cc8-b9ef-e2fef1b03f8d";
export const QF_APP_ID = "com.dabiru.mobile";
export const QF_USE_PRELIVE = true;

export const QF_AUTH_BASE_URL = QF_USE_PRELIVE
  ? "https://prelive-oauth2.quran.foundation"
  : "https://oauth2.quran.foundation";

export const QF_DISCOVERY = {
  authorizationEndpoint: `${QF_AUTH_BASE_URL}/oauth2/auth`,
  tokenEndpoint: `${QF_AUTH_BASE_URL}/oauth2/token`,
  revocationEndpoint: `${QF_AUTH_BASE_URL}/oauth2/revoke`,
};

export const MUSHAF_ID = 7; // Indopak16Lines