import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("auth/refresh/") ||
        originalRequest.url?.includes("auth/login/")) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("auth/refresh/", {});

        isRefreshing = false;
        processQueue();
        return api(originalRequest);

      } catch (err) {
        isRefreshing = false;
        processQueue(err);
        console.assertlog(err);
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// AUTH
export const signupApi = (data) =>
  api.post("auth/signup/", {
    organization_name: data.name,
    email: data.email,
    password: data.password,
  });

export const loginApi = (data) =>
  api.post("auth/login/", {
    email: data.email,
    password: data.password,
  });

export const logoutApi = () => api.post("auth/logout/");
export const profileApi = () => api.get("auth/me/");

// PROJECTS
export const createProjectApi = (data) => api.post("auth/project/", data);
export const showProjectApi = () => api.get("auth/projects/");
export const getProjectByIdApi = (id) => api.get(`auth/projects/${id}/`);
export const deleteProjectApi = (id) => api.delete(`auth/project/delete/${id}/`);

// TASKS
export const getTasksApi = (projectId) => api.get(`auth/tasks/?project=${projectId}`);
export const createTaskApi = (data) => api.post("auth/tasks/create/", data);
export const getTaskByIdApi = (id) => api.get(`auth/tasks/details/${id}/`); // ✅ trailing slash
export const deleteTaskApi = (id) => api.delete(`auth/tasks/delete/${id}/`);
export const updateTaskApi = (id, data) => api.put(`auth/tasks/update/${id}/`, data);

//Members
export const orgMembersApi = () => api.get("users/");