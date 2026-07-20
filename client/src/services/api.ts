import axios from "axios";

const API_URL =
  (import.meta as ImportMeta & {
    env: {
      VITE_API_URL?: string;
    };
  }).env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("truthlens_access_token");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("truthlens_access_token");
      localStorage.removeItem("truthlens_refresh_token");
      localStorage.removeItem("truthlens_user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);