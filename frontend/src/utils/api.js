import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Resumes
export const resumeAPI = {
    upload: (formData) => api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: () => api.get('/resumes'),
    getOne: (id) => api.get(`/resumes/${id}`),
    delete: (id) => api.delete(`/resumes/${id}`),
};

// Analysis
export const analysisAPI = {
    analyze: (data) => api.post('/analysis/analyze', data),
    getAll: () => api.get('/analysis'),
    getOne: (id) => api.get(`/analysis/${id}`),
    delete: (id) => api.delete(`/analysis/${id}`),
};