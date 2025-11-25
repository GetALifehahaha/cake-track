import React, { createContext, useState, useEffect, useContext} from 'react'
import {jwtDecode} from 'jwt-decode'
import api from '@/api/api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        auth().finally(() => setLoading(false));
    }, []);

    const auth = async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        
        if (!accessToken) {
            setUser(null);
            setIsAuthorized(false);
            return;        
        }

        try {
            const decodedToken = jwtDecode(accessToken);
            const tokenExpiration = decodedToken.exp;
            const currentDate = Date.now() / 1000;

            if (tokenExpiration < currentDate){
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
    }

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        if (!refreshToken) {
            setUser(null);
            setIsAuthorized(false);
            return;    
        }

        try {
            const response = await api.post('/users/token/refresh/', {
                refresh: refreshToken,
            });
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            await getUserData();
            setIsAuthorized(true);
        } catch (err) {
            // Clear invalid tokens
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setUser(null);
            setIsAuthorized(false);
        }
    }

    const getUserData = async () => {
        try {
            const response = await api.get('/me/');
            const userData = response.data
            setUser(userData);
        } catch {
            setUser(null);
        }
    }

    const login = async (username, password) => {
        try {
            const response = await api.post('/users/token/', {username, password});

            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            navigate('/')
            setIsAuthorized(true);
            return { success: true };
        } catch (err) {
            console.error('Login failed:', err);
            return { success: false, error: err.response?.data || err.message };
        }
    }

    const googleLogin = async (token) => {
        try {
            const response = await api.post('/users/google-auth/', {token: token});

            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            await getUserData();
            setIsAuthorized(true);
            return { success: true };
        } catch (err) {
            console.error('Google login failed:', err);
            return { success: false, error: err.response?.data || err.message };
        }
    }
    
    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setUser(null);
        setIsAuthorized(false);
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
    }

    return (
        <AuthContext.Provider value={{user, isAuthorized, setUser, login, googleLogin, register, setIsAuthorized, loading, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);