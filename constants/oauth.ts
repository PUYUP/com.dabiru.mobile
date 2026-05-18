export const QF_APP_ID = "com.dabiru.tafsir";
export const QF_CLIENT_ID = process.env.EXPO_PUBLIC_QF_CLIENT_ID ?? "";
export const QF_USE_PRELIVE = process.env.EXPO_PUBLIC_QF_USE_PRELIVE === "true";

export const QF_AUTH_BASE_URL = QF_USE_PRELIVE
  ? "https://prelive-oauth2.quran.foundation"
  : "https://oauth2.quran.foundation";

export const QF_DISCOVERY = {
  authorizationEndpoint: `${QF_AUTH_BASE_URL}/oauth2/auth`,
  tokenEndpoint: `${QF_AUTH_BASE_URL}/oauth2/token`,
  revocationEndpoint: `${QF_AUTH_BASE_URL}/oauth2/revoke`,
};

export const MUSHAF_ID = 11; // Tajweed