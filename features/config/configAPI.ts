import { MUSHAF_ID } from "@/constants/oauth";
import api from "@/services/apiClient";
import { UpdateConfigPayload } from "./configTyping";

// getting current config
export const getConfigAPI = async () => {
  try {
    const res = await api.get("/auth/v1/preferences");
    return res.data;
  } catch (error: any) {
    console.log("Error fetching config:", error.response.data); // Debug log
    throw error;
  }
};

// update current config
export const updateConfigAPI = async (payload: UpdateConfigPayload) => {
  try {
    const res = await api.post("/auth/v1/preferences?mushafId=" + MUSHAF_ID, payload);
    return res.data;
  } catch (error: any) {
    console.log("Error updating config:", error.response.data); // Debug log
    throw error;
  }
};

// bulk update config
// full payload available here: https://api-docs.quran.foundation/docs/user_related_apis_versioned/1.0.0/bulk-add-or-update-preferences/
export const bulkUpdateConfigAPI = async (payload: any) => {
  try {
    const res = await api.post("/auth/v1/preferences/bulk?mushafId=" + MUSHAF_ID, payload);
    return res.data;
  } catch (error: any) {
    console.log("Error bulk update config:", error.response.data); // Debug log
    throw error;
  }
};

// get languages
export const getLanguagesAPI = async () => {
  try {
    const res = await api.get("/content/api/v4/resources/languages");
    return res.data;
  } catch (error: any) {
    console.log("Error getting languages:", error.response.data); // Debug log
    throw error;
  }
};

// get translations
export const getTranslationsAPI = async () => {
  try {
    const res = await api.get("/content/api/v4/resources/translations");
    return res.data;
  } catch (error: any) {
    console.log("Error getting translations:", error.response.data); // Debug log
    throw error;
  }
};