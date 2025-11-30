import React, { createContext, useState, useEffect, useContext } from 'react';
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
    const [isAuthorized, setIsAuthorized] = useState(false); // Default to false
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        auth().finally(() => setLoading(false));
    }, []);

    const auth = async () => {
        try {
            // AsyncStorage is asynchronous!
            const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);

            if (!accessToken) {
                setUser(null);
                setIsAuthorized(false);
                return;
            }

            const decodedToken = jwtDecode(accessToken);
            const tokenExpiration = decodedToken.exp;
            const currentDate = Date.now() / 1000;

            if (tokenExpiration < currentDate) {
                await refreshToken();
            } else {
                await getUserData();
                setIsAuthorized(true);
            }
        } catch (err) {
            console.error('Authentication failed:', err);
            setUser(null);
            setIsAuthorized(false);
        }
    };

    const refreshToken = async () => {
        try {
            const token = await AsyncStorage.getItem(REFRESH_TOKEN);

            if (!token) {
                setUser(null);
                setIsAuthorized(false);
                return;
            }

            const response = await api.post('/users/token/refresh/', {
                refresh: token,
            });

            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await getUserData();
            setIsAuthorized(true);
        } catch (err) {
            console.error("Refresh failed", err);
            // Clear invalid tokens
            await AsyncStorage.removeItem(ACCESS_TOKEN);
            await AsyncStorage.removeItem(REFRESH_TOKEN);
            setUser(null);
            setIsAuthorized(false);
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

            // Store tokens asynchronously
            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await AsyncStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            setIsAuthorized(true);

            // Navigate to home/tabs after successful login
            router.replace('/');

            return { success: true };

        } catch (err) {
            console.error('Login failed:', err);
            return { success: false, error: "Login unsuccessful" };
        }
    };

    const googleLogin = async (token) => {
        try {
            const response = await api.post('/users/google-auth/', { token: token });

            await AsyncStorage.setItem(ACCESS_TOKEN, response.data.access);
            await AsyncStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            setIsAuthorized(true);

            router.replace('/');

            return { success: true };
        } catch (err) {
            console.error('Google login failed:', err);
            return { success: false, error: err.response?.data || err.message };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(ACCESS_TOKEN);
        await AsyncStorage.removeItem(REFRESH_TOKEN);
        setUser(null);
        setIsAuthorized(false);
        // Optional: Route back to login
        router.replace('/(auth)/login');
    };

    const register = async (username, password, first_name, last_name, email) => {
        try {
            await api.post('/users/user/register/', {
                username, password, first_name, last_name, email
            });
            return { success: true };
        } catch (err) {
            console.error('Registration failed:', err);
            return { success: false, error: err.response?.data || err.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthorized,
            setUser,
            login,
            googleLogin,
            register,
            setIsAuthorized,
            loading,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);