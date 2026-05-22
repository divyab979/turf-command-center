import axios from "axios";

export const api = axios.create({
  baseURL: "https://turf-backend-603l.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});