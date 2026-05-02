import api from "@/services/apiClientNew";
import { UpdateConfigPayload } from "./configTyping";

export const getConfigAPI = async () => {
  try {
    const res = await api.get("/auth/v1/preferences");
    return res.data;
  } catch (error: any) {
    console.log("Error fetching config:", error.response.data); // Debug log
    throw error;
  }
};

export const updateConfigAPI = async (payload: UpdateConfigPayload) => {
  console.log("updateConfigAPI called", payload); // Debug log

  try {
    const res = await api.post("/auth/v1/preferences?mushafId=11", payload);
    return res.data;
  } catch (error: any) {
    console.log("Error updating config:", error.response.data); // Debug log
    throw error;
  }
};