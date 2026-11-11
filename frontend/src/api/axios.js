import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_APP_URL}/api` });

// Add a request interceptor
API.interceptors.request.use(
  (config) => {
    // Guest checkout/order verification must not inherit a stale customer JWT.
    // `skipAuth` is an Axios-only flag and is removed before the request is sent.
    if (config.skipAuth) {
      delete config.skipAuth;
      if (config.headers) {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }
      return config;
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Grab the status and the current URL
    const status = error.response ? error.response.status : null;
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.includes("/auth/login");

    // 2. Only redirect if it's a 401 AND we aren't already trying to login
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      // Use window.location only as a last resort for global auth failures
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  },
);

export default API;
