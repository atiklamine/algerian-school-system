import axios from 'axios';

// Use environment variable if set, otherwise try to detect if on localhost or network
const getBaseURL = () => {
    // Check if a specific backend URL is provided in env (e.g., for production or specific fixed dev setups)
    // Note: process.env.NEXT_PUBLIC_API_URL can be used here if needed

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        // If we are on a network IP or custom domain, assume backend is on the same host but port 3000
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `${protocol}//${hostname}:3000`;
        }
    }
    return 'http://localhost:3000';
};

const BASE_URL = getBaseURL();

// Log the API base URL for debugging
if (typeof window !== 'undefined') {
    console.log('🌐 API Base URL:', BASE_URL);
}

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized! Token might be expired.');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                const currentPath = window.location.pathname;
                const locale = currentPath.startsWith('/ar') ? 'ar' : 'fr';
                window.location.href = `/${locale}/login`;
            }
        }
        return Promise.reject(error);
    }
);
