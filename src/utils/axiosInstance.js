import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL || '';
    if (!url) {
        url = import.meta.env.MODE === 'production' 
            ? 'https://api.rcacademy.online' 
            : `${window.location.protocol}//${window.location.hostname}:5000`;
    } else if (url.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        url = url.replace('localhost', window.location.hostname);
    }
    return url;
};

const axiosInstance = axios.create({
    baseURL: getBaseURL(), 
});

axiosInstance.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo') 
            ? JSON.parse(localStorage.getItem('userInfo')) 
            : null;
        
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Clear session and redirect on 401 Unauthorized errors (e.g. purged database)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[Session Expiry] Token is invalid or user was deleted. Clearing session...');
            localStorage.removeItem('userInfo');
            // Safely redirect to login page
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
