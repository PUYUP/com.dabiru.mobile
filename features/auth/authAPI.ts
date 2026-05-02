import api from "@/services/apiClient";
const BASE_URL = "https://qf-token-exchange.pointilis-noktah-teknologi.workers.dev";

export const exchangeTokenAPI = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/api/auth/qf/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const getUserProfileAPI = async () => {
  try {
    const res = await api.get("/quran-reflect/v1/users/profile");
    return res.data;
  } catch (error: any) {
    console.log("Error fetching user profile:", error.response.data); // Debug log
    throw error;
  }
};

export const refreshTokenAPI = async (refreshToken: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/qf/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const revokeTokenAPI = async (refreshToken: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/qf/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};