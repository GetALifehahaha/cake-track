import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import api from '@/api/api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Polyfill for jwt-decode in React Native environment
import "core-js/stable/atob";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    const getErrorMessage = (errorData, fallback = 'Request failed') => {
        if (!errorData) return fallback;
        if (typeof errorData === 'string') return errorData;
        if (errorData.detail) return errorData.detail;

        const firstKey = Object.keys(errorData)[0];
        if (firstKey) {
            const firstValue = errorData[firstKey];
            if (Array.isArray(firstValue) && firstValue.length > 0) {
                return String(firstValue[0]);
            }
            if (typeof firstValue === 'string') {
                return firstValue;
            }
        }

        return fallback;
    };

    useEffect(() => {
        auth().finally(() => setLoading(false));
    }, []);

    // Helper: Validates token expiration
    const isTokenValid = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp > Date.now() / 1000;
        } catch (e) {
            return false;
        }
    };

    const auth = async () => {
        try {
            const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);

            // GUEST MODE: If no token, we simply finish loading. 
            // We do NOT treat this as an error, just an unauthorized state.
            if (!accessToken) {
                handleGuestState();
                return;
            }

            if (!isTokenValid(accessToken)) {
                await refreshToken();
            } else {
                await getUserData();
                setIsAuthorized(true);
            }
        } catch (err) {
            console.error('Authentication check failed:', err);
            handleGuestState();
        }
    };

    const handleGuestState = () => {
        setUser(null);
        setIsAuthorized(false);
    };

    const refreshToken = async () => {
        try {
            const token = await AsyncStorage.getItem(REFRESH_TOKEN);
            if (!token) {
                handleGuestState();
                return;
            }

            const response = await api.post('/users/token/refresh/', { refresh: token });

            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await getUserData();
            setIsAuthorized(true);
        } catch (err) {
            console.error("Refresh failed", err);
            await logout(); // Clean up if refresh fails
        }
    };

    const getUserData = async () => {
        try {
            const response = await api.get('/me/');
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user data", error);
            setUser(null);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/users/token/', { username, password });
            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await AsyncStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            setIsAuthorized(true);
            return { success: true };
        } catch (err) {
            console.error('Login failed:', err);

            const errorData = err.response?.data;
            const code = Array.isArray(errorData?.code) ? errorData.code[0] : errorData?.code;
            
            if (code === 'account_deactivated') {
                return {
                    success: false,
                    deactivated: true,
                    username: Array.isArray(errorData?.username) ? errorData.username[0] : errorData?.username,
                    message: Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail,
                    daysUntilDeletion: Array.isArray(errorData?.days_until_deletion) ? errorData.days_until_deletion[0] : errorData?.days_until_deletion,
                };
            }

            return {
                success: false,
                error: getErrorMessage(errorData, 'Login unsuccessful')
            };
        }
    };

    const reactivateAccount = async (username, password, confirmation) => {
        try {
            const response = await api.post('/users/user/reactivate/', {
                username,
                password,
                confirmation,
            });

            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await AsyncStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            setIsAuthorized(true);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                code: err.response?.data?.code,
                error: getErrorMessage(err.response?.data, 'Failed to reactivate account'),
            };
        }
    };

    const googleLogin = async (token, source = 'app') => {
        try {
            // Send 'source' to backend
            const response = await api.post('/users/google-auth/', {
                token: token,
                source: source
            });
            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await AsyncStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            setIsAuthorized(true);
            return { success: true };
        } catch (err) {
            console.error('Google login failed:', err);
            return { success: false, error: err.response?.data?.detail || err.message };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(ACCESS_TOKEN);
        await AsyncStorage.removeItem(REFRESH_TOKEN);
        handleGuestState();
        router.replace('/(auth)/login');
    };

    const register = async (username, password, first_name, last_name, email) => {
        try {
            await api.post('/users/user/register/', {
                username, password, first_name, last_name, email
            });
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: getErrorMessage(err.response?.data, err.message)
            };
        }
    };

    /**
     * NEW FEATURE: Action Guard
     * Usage: ensureAuthenticated(() => addToCart(item), { redirectTo: '/cart' });
     */
    const ensureAuthenticated = (actionCallback, redirectParams = {}) => {
        if (isAuthorized && user) {
            // User is logged in, run the action (e.g., Order, Like, Add to Cart)
            actionCallback();
        } else {
            // User is Guest, prompt them or redirect
            Alert.alert(
                "Login Required",
                "You need to log in to perform this action.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Login",
                        onPress: () => {
                            // Navigate to login, passing the params so Login screen knows where to go back to
                            router.push({
                                pathname: '/(auth)/login',
                                params: redirectParams
                            });
                        }
                    }
                ]
            );
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthorized,
            loading,
            login,
            googleLogin,
            register,
            reactivateAccount,
            logout,
            getUserData,
            ensureAuthenticated // <--- Exporting the new helper
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);