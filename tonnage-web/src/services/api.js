import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tonnage_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Clear token on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tonnage_token');
      localStorage.removeItem('tonnage_user');
      window.dispatchEvent(new Event('tonnage_auth_changed'));
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password) => api.post('/auth/register', { email, password }),
};

// Exercise Service
export const exerciseService = {
  getAll: async () => {
    const res = await api.get('/exercises');
    return res.data;
  },
  getProgress: async (exerciseId) => {
    const res = await api.get(`/exercises/${exerciseId}/progress`);
    return res.data;
  }
};
export const exerciseApi = exerciseService;

// Workout Session Service
export const workoutService = {
  getAll: async () => {
    const res = await api.get('/workouts');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
  },
  create: async (sessionData) => {
    const res = await api.post('/workouts', sessionData);
    return res.data;
  }
};
export const workoutApi = workoutService;

export default api;