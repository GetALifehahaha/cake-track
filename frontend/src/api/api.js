import axios from 'axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants'
import { isTokenExpired, isSessionValid } from '@/utils/tokenUtils'

const url = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: url
})

const PUBLIC_AUTH_PATHS = ['/login', '/forgotPassword', '/setAccount'];

const isOnPublicAuthPage = () => {
    if (typeof window === 'undefined') return false;
    const currentPath = window.location?.pathname || '';
    return PUBLIC_AUTH_PATHS.some(path => currentPath.startsWith(path));
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)

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
}

api.interceptors.response.use(
    response => response,
    async error => {
        // intercept request
        const request = error.config;

        // if request give unauthorized
        if (error.response?.status === 401 && !request._retry) {
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

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({resolve, reject})
                }).then(newToken => {
                    request.headers.Authorization = `Bearer ${newToken}`
                    return api(request);
                })
            }

            isRefreshing = true;

            // get refresh token, return Promise if no refresh token is found: 
            // login again
            const refresh = localStorage.getItem(REFRESH_TOKEN)

            if (!refresh || isTokenExpired(refresh, 0)) {
                localStorage.removeItem(ACCESS_TOKEN)
                localStorage.removeItem(REFRESH_TOKEN)
                if (!isOnPublicAuthPage()) {
                    window.dispatchEvent(new CustomEvent('auth:logout'))
                }
                isRefreshing = false;
                return Promise.reject(error)
            }
            
            try {
                const res = await axios.post(
                    `${url}/users/token/refresh/`, {refresh}
                )

                const access = res.data.access
                localStorage.setItem(ACCESS_TOKEN, access)

                if (res.data.refresh) {
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                }

                processPendingQueue(null, access);

                request.headers.Authorization = `Bearer ${access}`
                return api(request)

            } catch (error) {
                processPendingQueue(error, null);
                if (!isOnPublicAuthPage()) {
                    window.dispatchEvent(new CustomEvent('auth:logout'))
                }
                localStorage.removeItem(ACCESS_TOKEN)
                localStorage.removeItem(REFRESH_TOKEN)
                return Promise.reject(error)
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error)
    }
)

export default api;