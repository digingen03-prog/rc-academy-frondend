import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '', // Use environment variable in production, fallback to proxy in dev
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

export default axiosInstance;
