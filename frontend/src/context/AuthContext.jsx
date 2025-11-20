import React, {createContext, useState, useEffect, useContext} from 'react'
import {jwtDecode} from 'jwt-decode'
import api from '@/api/api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const initApp = async () => {
            try {
                await auth();
            } catch {
                setIsAuthorized(false);
                setUser(null);
                navigate('/login')
            } finally {
                setLoading(false);
            }
        }

        initApp();
    }, []);

    const auth = async () => {
        setLoading(true);
        const accessToken = localStorage.getItem(ACCESS_TOKEN)

        if (!accessToken) {
            setUser(null);
            setIsAuthorized(false);
            setLoading(false);
            navigate('/login');
            return;
        }
        try {

            const decodedToken = jwtDecode(accessToken);
            const tokenExpiration = decodedToken.exp
            const currentDate = Date.now() / 1000
            
            if (tokenExpiration < currentDate) {
                await refresh();
            } else {
                await getUserData();
                setIsAuthorized(true)
            }
        } catch {
            setUser(null);
            setIsAuthorized(false);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }

    const refresh = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        if (!refreshToken) {
            setUser(null);
            setIsAuthorized(false);
            navigate('/login');
            return;
        }

        try {
            const response = await api.post('/users/token/refresh/', {
                refresh: refreshToken
            })
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            await getUserData();
        } catch {
            setUser(null);
            setIsAuthorized(false);
            navigate('/login');
        }
    }

    const getUserData = async () => {
        try {
            const response = await api.get('/me/')
            setUser(response.data)
        } catch {
            setUser(null)
            setIsAuthorized(false);
            navigate('/login');
        }
    }

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await api.post('/users/token/', {username, password});

            localStorage.setItem(ACCESS_TOKEN, response.data.access)
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh)

            await getUserData();
            setIsAuthorized(true);
        } catch (error) {
            setIsAuthorized(false);
            return {status: "error", detail: error.response?.data?.detail || "Login Failed"}
        } finally {
            setLoading(false);
        }
        
    }

    return (
        <AuthContext.Provider value={{user, isAuthorized, setUser, login, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);
