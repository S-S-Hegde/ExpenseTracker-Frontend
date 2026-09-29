import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to all outgoing requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auraledger_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const expenseAPI = {
  getExpenses: (params) => api.get("/expenses", { params }),
  createExpense: (data) => api.post("/expenses", data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  bulkDeleteExpenses: (ids) => api.post("/expenses/bulk-delete", { ids }),
};

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
};

export const sessionAPI = {
  getSessions: () => api.get("/sessions"),
  createSession: (data) => api.post("/sessions", data),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
};

export const uploadAPI = {
  uploadReceipt: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const advisorAPI = {
  getMetrics: () => api.get("/advisor/metrics"),
};

export default api;
