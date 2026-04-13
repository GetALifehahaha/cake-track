import axios from 'axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants'
import { isTokenExpired } from '@/utils/tokenUtils'

const url = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: url
})

const PUBLIC_AUTH_ENDPOINTS = [
    'users/token/',
    'users/token/refresh/',
    'users/google-auth/',
    'users/user/reactivate/',
    'users/user/activate/',
    'request-otp/',
    'verify-otp/',
    'change-password-token/',
]

const isPublicAuthEndpoint = (requestUrl = '') => {
    return PUBLIC_AUTH_ENDPOINTS.some(path => requestUrl.includes(path))
}

const PUBLIC_AUTH_PATHS = ['/login', '/forgotPassword', '/setAccount'];

const isOnPublicAuthPage = () => {
    if (typeof window === 'undefined') return false;
    const currentPath = window.location?.pathname || '';
    return PUBLIC_AUTH_PATHS.some(path => currentPath.startsWith(path));
}

api.interceptors.request.use(
    async (config) => {
        if (isPublicAuthEndpoint(config.url || '')) {
            return config;
        }

        let token = localStorage.getItem(ACCESS_TOKEN)

        // Refresh slightly before expiry so requests don't fail once with 401.
        if (token && isTokenExpired(token, 15)) {
            try {
                token = await refreshAccessToken();
            } catch {
                token = null;
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
)

let isRefreshing = false;
let pendingQueue = [];

const processPendingQueue = (error, newToken = null) => {
    pendingQueue.forEach(({resolve, reject}) => {
        if (error) reject(error);
        else resolve(newToken);
    })

    pendingQueue = [];
}

const refreshAccessToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
        });
    }

    const refresh = localStorage.getItem(REFRESH_TOKEN)

    if (!refresh || isTokenExpired(refresh, 0)) {
        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        if (!isOnPublicAuthPage()) {
            window.dispatchEvent(new CustomEvent('auth:logout'))
        }
        throw new Error('Refresh token expired or missing');
    }

    isRefreshing = true;

    try {
        const res = await axios.post(`${url}users/token/refresh/`, { refresh });
        const access = res.data.access;

        localStorage.setItem(ACCESS_TOKEN, access)

        if (res.data.refresh) {
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
        }

        processPendingQueue(null, access);
        return access;
    } catch (error) {
        processPendingQueue(error, null);
        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        if (!isOnPublicAuthPage()) {
            window.dispatchEvent(new CustomEvent('auth:logout'))
        }
        throw error;
    } finally {
        isRefreshing = false;
    }
}

api.interceptors.response.use(
    response => response,
    async error => {
        // intercept request
        const request = error.config;

        // if request give unauthorized
        if (error.response?.status === 401 && !request._retry && !isPublicAuthEndpoint(request?.url || '')) {
            // turn retry = true
            request._retry = true;

            // if (!navigator.onLine) {
            //     if (isSessionValid()) {
            //         return Promise.reject({offline: true, message: "Device is currently offline. Activating offline mode..."})
            //     } else {
            //         if (!isOnPublicAuthPage()) {
            //             window.dispatchEvent(new CustomEvent('auth:logout'))
            //         }
            //         return Promise.reject({sessionExpired: true})
            //     }
            // } 

            try {
                const access = await refreshAccessToken();

                request.headers.Authorization = `Bearer ${access}`
                return api(request)

            } catch (error) {
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

export default api;