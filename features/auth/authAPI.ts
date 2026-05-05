import api from "@/services/apiClient";
import { supabase } from "@/services/supabase";
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

export const supabaseSignUpWithEmailAPI = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Supabase sign-up error:", error);
    throw error;
  }

  return data;
};

export const supabaseSignInWithEmailAPI = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log("Supabase sign-in error:", error);
    throw error;
  }

  return data;
};

export const supabaseSignOutAPI = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Supabase sign-out error:", error);
    throw error;
  }
};