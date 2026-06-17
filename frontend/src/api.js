// frontend/src/api.js
import axios from 'axios';

// Dynamically chooses your live Render URL if it exists, otherwise defaults to local Django
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically inject JWT tokens into every request if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
export { API_BASE_URL };