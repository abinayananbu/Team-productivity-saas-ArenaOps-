import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =======================
   REQUEST INTERCEPTOR
======================= */
api.interceptors.request.use(
  (config) => {
    // Get token (change if you store it differently)
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/* =======================
   RESPONSE INTERCEPTOR
======================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");

        const res = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh }
        );

        localStorage.setItem("access_token", res.data.access);

        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        // refresh token expired
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);





export const signupApi = (data) =>
  api.post('auth/signup/', {
    organization_name: data.name,
    email: data.email,
    password: data.password,
  });


export const loginApi = (data) =>
    api.post('auth/login/', {
    email: data.email,
    password: data.password,
  });