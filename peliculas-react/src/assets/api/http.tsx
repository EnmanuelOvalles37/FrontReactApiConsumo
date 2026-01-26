// src/api/http.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// añade el token del login a TODAS las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); 
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
