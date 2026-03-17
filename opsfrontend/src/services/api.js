import axios from "axios";

const BASE_URL = "/api";

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
let hasSession = false; //  track if user has ever logged in

export const setHasSession = (val) => { hasSession = val; }; //  export setter

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

    if (
      originalRequest.url?.includes("auth/refresh/") ||
      originalRequest.url?.includes("auth/login/")
    ) {
      return Promise.reject(error);
    }

    //  Don't attempt refresh if there's no session
    if (!hasSession) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
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
        hasSession = false; //  clear session on failed refresh
        processQueue(err);
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

// USER
export const profileApi = () => api.get("auth/me/");
export const uploadAvatarApi = (data) =>
  api.post("auth/me/avatar/", data, {
    headers: {
      "Content-Type": undefined,},
  });
export const removeAvatarApi = () => api.delete("auth/me/avatar/");

// PROJECTS
export const createProjectApi = (data) => api.post("auth/project/", data);
export const showProjectApi = () => api.get("auth/projects/");
export const getProjectByIdApi = (id) => api.get(`auth/projects/${id}/`);
export const deleteProjectApi = (id) =>
  api.delete(`auth/project/delete/${id}/`);

// TASKS
export const getTasksApi = (projectId) =>api.get(`auth/tasks/?project=${projectId}`);
export const createTaskApi = (data) => api.post("auth/tasks/create/", data);
export const getTaskByIdApi = (id) => api.get(`auth/tasks/details/${id}/`);
export const deleteTaskApi = (id) => api.delete(`auth/tasks/delete/${id}/`);
export const updateTaskApi = (id, data) =>api.put(`auth/tasks/update/${id}/`, data);

// MEMBERS
export const orgMembersApi = () => api.get("users/");
export const updateRoleApi = (id, data) => api.patch(`users/${id}/`, data);
export const removeMemberApi = (id) => api.delete(`users/${id}/`)

// ACTIVITY LOG
export const showAuditApi = () => api.get("auth/activity-logs/");

// DOCUMENTS
export const createDocsApi = (data) =>api.post("auth/documents/create/", data);
export const showDocsApi = () => api.get("/auth/documents/");
export const saveDocApi = (docId, data) =>api.patch(`/auth/documents/${docId}/`, data);
export const deleteDocApi = (id) => api.delete(`auth/document/delete/${id}/`);