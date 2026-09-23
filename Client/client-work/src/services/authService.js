import { apiClient } from '@/lib/apiClient'

const CAMPUS_ID = import.meta.env.VITE_CAMPUS_ID

export function signupStudent({ name, studentId, email }) {
    if (!CAMPUS_ID) {
        return Promise.reject(new Error('Campus is not configured. Please set VITE_CAMPUS_ID.'))
    }

    return apiClient.post('/auth/signup', {
        name,
        studentId,
        email,
        campusId: CAMPUS_ID,
    })
}

export function sendLoginLink(email) {
    return apiClient.post('/auth/login-link', { email })
}

export function verifyLoginLink(token) {
    return apiClient.post('/auth/verify-login-link', { token })
}

export function completeProfile(profile) {
    return apiClient.post('/auth/complete-profile', profile)
}

export function refreshAccessToken() {
    return apiClient.post('/auth/refresh')
}

export function logoutStudent() {
    return apiClient.post('/auth/logout')
}
