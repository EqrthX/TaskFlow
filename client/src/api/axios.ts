import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3231/api", // 👈 URL Backend ของเรา
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: ถ้ามี Token ให้แนบไปด้วยทุกครั้ง
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;