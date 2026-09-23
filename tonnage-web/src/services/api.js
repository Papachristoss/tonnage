import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
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
  // unit ('kg' | 'lb') only changes the wording of progressionAdvice; numbers are always kg
  getProgress: async (exerciseId, unit = 'kg') => {
    const res = await api.get(`/exercises/${exerciseId}/progress`, { params: { unit } });
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

// Profile Service
export const profileService = {
  get: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  update: async ({ username, age, weightKg }) => {
    const res = await api.put('/profile', { username, age, weightKg });
    return res.data;
  },
  updateAvatar: async (profilePicture) => {
    const res = await api.put('/profile/avatar', { profilePicture });
    return res.data;
  },
  removeAvatar: async () => {
    const res = await api.put('/profile/avatar', { profilePicture: null });
    return res.data;
  },
  changeEmail: async (newEmail, currentPassword) => {
    const res = await api.put('/profile/email', { newEmail, currentPassword });
    return res.data; // { token, email }
  },
  changePassword: async (currentPassword, newPassword) => {
    await api.put('/profile/password', { currentPassword, newPassword });
  },
  // Both nullable: null clears that goal
  updateGoals: async ({ weeklyWorkoutGoal, weeklyVolumeGoalKg }) => {
    const res = await api.put('/profile/goals', { weeklyWorkoutGoal, weeklyVolumeGoalKg });
    return res.data;
  },
  deleteAccount: async (currentPassword) => {
    await api.delete('/profile', { data: { currentPassword } });
  },
};

export default api;