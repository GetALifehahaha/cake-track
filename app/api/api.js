import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            console.error(`Error ${error.response.status}: ${error.config?.url}`);
            // JSON.stringify makes the object readable in the console
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            // Network errors (server down, no internet)
            console.error("Network Error:", error.message);
        }
        // Check if error is 401 (Unauthorized) AND we haven't retried this request yet
        if (error.response?.status === 401 ||
    error.response?.status === 500 || !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried to prevent infinite loops

            try {
                // 1. Get the refresh token from storage
                const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);

                // if (!refreshToken) {
                //     throw new Error("No refresh token available");
                // }

                // 2. Call backend to get a new access token
                // NOTE: Use axios.post (not api.post) to avoid using the interceptors again
                const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/token/refresh/`, {
                    refresh: refreshToken
                });

                const newAccessToken = response.data.access;

                // 3. Save the new token to storage
                await AsyncStorage.setItem(ACCESS_TOKEN, newAccessToken);

                // 4. Update the Authorization header for this failed request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 5. Update the default header for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                // 6. Retry the original request with the new token
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed (token expired or invalid) -> Logout user
                console.log("Session expired, logging out...");

                // Clear all auth data
                await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);

                // Force redirect to login
                // optional: checks if router is ready/mounted before calling
                if (router.canGoBack() || router.canDismiss()) {
                    router.dismissAll();
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;