import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

let accessTokenGetter = () => null
let accessTokenSetter = () => {}
let unauthorizedHandler = () => {}
let refreshPromise = null

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

export function registerAuthHandlers({ getAccessToken, setAccessToken, onUnauthorized }) {
    accessTokenGetter = getAccessToken
    accessTokenSetter = setAccessToken
    unauthorizedHandler = onUnauthorized
}

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (!error?.response) {
        return 'Network error. Please check your connection and try again.'
    }

    const data = error.response.data

    if (typeof data?.message === 'string') {
        return data.message
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors
            .map((item) => item?.message || item)
            .filter(Boolean)
            .join(', ')
    }

    return fallback
}

apiClient.interceptors.request.use((config) => {
    const accessToken = accessTokenGetter()

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status !== 401 ||
            originalRequest?._retry ||
            originalRequest?.url?.includes('/auth/refresh')
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            refreshPromise ||= refreshClient
                .post('/auth/refresh')
                .then((response) => response.data?.data?.accessToken)
                .finally(() => {
                    refreshPromise = null
                })

            const newAccessToken = await refreshPromise

            if (!newAccessToken) {
                throw new Error('Missing refreshed access token')
            }

            accessTokenSetter(newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

            return apiClient(originalRequest)
        } catch (refreshError) {
            unauthorizedHandler()
            return Promise.reject(refreshError)
        }
    }
)
