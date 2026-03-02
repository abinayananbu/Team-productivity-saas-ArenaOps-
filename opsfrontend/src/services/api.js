import axios from "axios";
import { data } from "react-router-dom";

const BASE_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
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
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

/* =======================
   RESPONSE INTERCEPTOR
======================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        const res = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh }
        );

        localStorage.setItem("access", res.data.access);

        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ALL API's

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

//Show Profile
export const profileApi = () =>
  api.get("auth/me/");

//Create Project
export const createProjectApi = (data) =>
  api.post('auth/project/',data)

  //Show projects
export const showProjectApi = () =>
  api.get('auth/projects/'); 

//Show project by Id
export const getProjectByIdApi = (id) =>
  api.get(`auth/projects/${id}/`);

//Delete project
export const deleteProjectApi = (id) =>
  api.delete(`auth/project/delete/${id}/`)

//Show Task
export const getTasksApi = (projectId) =>
  api.get(`auth/tasks/?project=${projectId}`);

//Create Task
export const createTaskApi = (data) =>
  api.post("auth/tasks/create/", data);

//Show task by Id
export const getTaskByIdApi = (id) =>
  api.get(`auth/tasks/details/${id}`);

// Delete task
export const deleteTaskApi = (id) =>
  api.delete(`auth/tasks/delete/${id}/`);

// Update task
export const updateTaskApi = (id, data) =>
  api.put(`auth/tasks/update/${id}/`, data);