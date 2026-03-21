import axios from "axios";
import toast from "react-hot-toast";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3231/api",
  withCredentials: true, // 👈 เปิดให้รับและส่ง Cookie อัตโนมัติ
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if(error.response && error.response.status === 429) {
      const backendMessage = error.response.data.message || "จำนวนคำขอมากเกินไป";
      toast.error(backendMessage, {duration: 400});
    }
    return Promise.reject(error);
  }
)

export default api;