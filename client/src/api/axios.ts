import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3231/api",
  withCredentials: true, // 👈 เปิดให้รับและส่ง Cookie อัตโนมัติ
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;