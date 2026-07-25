import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Nécessaire pour que le cookie httpOnly `refresh_token` posé par le
    // backend soit envoyé/reçu (le backend active allowCredentials côté CORS).
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (reponse) => reponse,
    (error: AxiosError) => {
        if (error.response?.status == 401) {
            useAuthStore.getState().clear();

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
