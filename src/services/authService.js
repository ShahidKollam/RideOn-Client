import { apiClient } from '@/lib/apiClient'

const CAMPUS_ID = import.meta.env.VITE_CAMPUS_ID

export function signupStudent({ name, studentId, email }) {
    if (!CAMPUS_ID) {
        return Promise.reject(new Error('Campus is not configured. Please set VITE_CAMPUS_ID.'))
    }

    return apiClient.post('/api/auth/signup', {
        name,
        studentId,
        email,
        campusId: CAMPUS_ID,
    })
}

export function sendLoginLink(email) {
    return apiClient.post('/api/auth/login-link', { email })
}

export function verifyLoginLink(token) {
    return apiClient.post('/api/auth/verify-login-link', { token })
}

export function completeProfile(profile) {
    return apiClient.post('/api/auth/complete-profile', profile)
}

export function refreshAccessToken() {
    return apiClient.post('/api/auth/refresh')
}

export function logoutStudent() {
    return apiClient.post('/api/auth/logout')
}
