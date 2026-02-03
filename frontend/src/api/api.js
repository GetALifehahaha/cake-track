import axios from 'axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants'

const url = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: url
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
)

api.interceptors.response.use(
    response => response,
    async error => {
        // intercept request
        const request = error.config;

        // if request give unauthorized
        if (error.response?.status === 401 && !request._retry) {
            // turn retry = true
            request._retry = true;

            // get refresh token, return Promise if no refresh token is found: 
            // login again
            const refresh = localStorage.getItem(REFRESH_TOKEN)
            if (!refresh) return Promise.reject(error)
            
            try {
                const res = await axios.post(
                    `${url}/users/token/refresh/`, {refresh}
                )

                const access = res.data.access
                localStorage.setItem(ACCESS_TOKEN, access)

                request.headers.ACCESS_TOKEN = `Bearer ${access}`
                return api(request)

            } catch (error) {
                localStorage.remove(ACCESS_TOKEN)
                localStorage.remove(REFRESH_TOKEN)
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

export default api;