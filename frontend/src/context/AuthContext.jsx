import React, { createContext, useState, useEffect, useContext, useRef} from 'react'
import {jwtDecode} from 'jwt-decode'
import api from '@/api/api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastContext'
import { refreshTokenMinutesRemaining } from '@/utils/tokenUtils'

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const {addToast} = useToast();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const wasAuthorizedRef = useRef(false);

    const [sessionMinutesRemaining, setSessionMinutesRemaining] = useState(refreshTokenMinutesRemaining());
    const sessionWarning = isAuthorized && sessionMinutesRemaining > 0 && sessionMinutesRemaining < 60

    const getUserRole = (userData) => {
        if (userData?.is_staff) return 'admin';
        if (Array.isArray(userData?.groups) && userData.groups[0] === 'cashier') return 'cashier';
        return null;
    };

    const isAllowedDashboardUser = (userData) => getUserRole(userData) !== null;

    const handleDisallowedRoleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setUser(null);
        setIsAuthorized(false);
        navigate('/login');
    };


    useEffect(() => {
        auth().finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (isAuthorized) {
            wasAuthorizedRef.current = true;
        }
    }, [isAuthorized]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSessionMinutesRemaining(refreshTokenMinutesRemaining())
        }, 60000);

        return () => clearInterval(interval)
    })

    useEffect(() => {
        const handleForcedLogout = () => {
            const wasLoggedIn = wasAuthorizedRef.current;
            setUser(null);
            setIsAuthorized(false);
            wasAuthorizedRef.current = false;
            if (wasLoggedIn) {
                addToast("Your session has expired. Please log in again.", "info");
            }
            navigate('/login');
        }

        window.addEventListener('auth:logout', handleForcedLogout);
        return () => window.removeEventListener('auth:logout', handleForcedLogout);
    }, [navigate])

    const auth = async () => {
        try {
            const userData = await getUserData();

            if (!isAllowedDashboardUser(userData)) {
                handleDisallowedRoleLogout();
                return;
            }

            setIsAuthorized(true);
        } catch (err) {
            setUser(null);
            setIsAuthorized(false);
        }
    }

    // const refreshToken = async () => {
    //     const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    //     if (!refreshToken) {
    //         setUser(null);
    //         setIsAuthorized(false);
    //         return;    
    //     }

    //     try {
    //         const response = await api.post('/users/token/refresh/', {
    //             refresh: refreshToken,
    //         });
    //         localStorage.setItem(ACCESS_TOKEN, response.data.access);
    //         await getUserData();
    //         setIsAuthorized(true);
    //     } catch (err) {
    //         // Clear invalid tokens
    //         localStorage.removeItem(ACCESS_TOKEN);
    //         localStorage.removeItem(REFRESH_TOKEN);
    //         setUser(null);
    //         setIsAuthorized(false);
    //     }
    // }

    const getUserData = async () => {
        try {
            const response = await api.get('/me/');
            const userData = response.data
            setUser(userData);
            return userData;
        } catch (err) {
            setUser(null);
            throw err
        }
    }

    const login = async (username, password) => {
        try {
            const response = await api.post('/users/token/', {username, password});

            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            const userData = await getUserData();

            if (!isAllowedDashboardUser(userData)) {
                handleDisallowedRoleLogout();
                return { success: false, error: 'role_not_allowed' };
            }

            window.dispatchEvent(new CustomEvent('auth:login'));
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

            const userData = await getUserData();

            if (!isAllowedDashboardUser(userData)) {
                handleDisallowedRoleLogout();
                return { success: false, error: 'role_not_allowed' };
            }

            window.dispatchEvent(new CustomEvent('auth:login'));
            setIsAuthorized(true);
            return { success: true };
        } catch (err) {
            addToast("Login failed.", "error")
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
        <AuthContext.Provider value={{user, getUserData, isAuthorized, setUser, login, googleLogin, register, setIsAuthorized, loading, logout, sessionMinutesRemaining, sessionWarning}}>
            {sessionWarning && <div className="w-full bg-warning-fill/20 text-warning-text text-xs font-medium text-center py-1.5 px-4">Your session will expire in {sessionMinutesRemaining} minutes. Please log in again before it expires.</div>}
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);