import axios from "axios";
import { AUTH_TOKEN_KEY } from "../../features/auth/services/authStorage";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const isPublicAuthRequest = ["/auth/login", "/auth/register", "/auth/logout"]
    .some((path) => config.url?.startsWith(path));
  if (token && !isPublicAuthRequest) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isPublicAuthRequest = ["/auth/login", "/auth/register", "/auth/logout"]
        .some((path) => requestUrl.startsWith(path));
      if (!isPublicAuthRequest && localStorage.getItem(AUTH_TOKEN_KEY)) {
        window.dispatchEvent(new Event("vet:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
