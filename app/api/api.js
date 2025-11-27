import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_TOKEN } from './constants';

// 1. Setup Base URL
// In Expo, use variables prefixed with EXPO_PUBLIC_ in your .env file
const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL
});

api.interceptors.request.use(
    // 2. Make this function ASYNC because AsyncStorage is async
    async (config) => {
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN);

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error retrieving token for API request", error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;