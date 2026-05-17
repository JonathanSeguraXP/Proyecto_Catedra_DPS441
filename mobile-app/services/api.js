import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './config';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            AsyncStorage.removeItem('token');
            AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;
