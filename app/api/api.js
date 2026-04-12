import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').trim()

const PUBLIC_AUTH_ENDPOINTS = [
    '/users/token/',
    '/users/token/refresh/',
    '/users/user/register/',
    '/users/google-auth/',
    '/users/user/reactivate/',
    '/users/user/activate/',
    '/request-otp/',
    '/verify-otp/',
    '/change-password-token/',
];

const isPublicAuthEndpoint = (requestUrl = '') =>
    PUBLIC_AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));


const api = axios.create({
    baseURL: API_BASE_URL
});

api.interceptors.request.use(
    async (config) => {
        try {
            const requestUrl = config?.url || '';
            if (isPublicAuthEndpoint(requestUrl)) {
                return config;
            }

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
        const requestUrl = originalRequest?.url || '';
        const isAuthEndpoint = isPublicAuthEndpoint(requestUrl);

        if (error.response) {
            console.error(`Error ${error.response.status}: ${error.config?.url}`);
            // JSON.stringify makes the object readable in the console
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            // Network errors (server down, no internet)
            console.error("Network Error:", error.message);
        }
        // Refresh only for authenticated-session 401 errors on non-auth endpoints
        if (!isAuthEndpoint && error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true; // Mark as retried to prevent infinite loops

            try {
                // 1. Get the refresh token from storage
                const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);

                if (!refreshToken) {
                    return Promise.reject(error);
                }
                // if (!refreshToken) {
                //     throw new Error("No refresh token available");
                // }

                // 2. Call backend to get a new access token
                // NOTE: Use axios.post (not api.post) to avoid using the interceptors again
                const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
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
                
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;