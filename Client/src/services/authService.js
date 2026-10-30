import { apiClient } from '@/lib/apiClient'

const CAMPUS_ID = import.meta.env.VITE_CAMPUS_ID

/** Default campus list — VITE_CAMPUS_ID remains the source of truth for the active campus. */
export function getSignupCampuses() {
    const id = CAMPUS_ID
    if (!id) return []
    return [
        {
            id,
            name: 'NIT Calicut',
            location: 'Kozhikode, Kerala',
        },
    ]
}

export function signupStudent({ name, studentId, email, campusId }) {
    const resolvedCampusId = campusId || CAMPUS_ID
    if (!resolvedCampusId) {
        return Promise.reject(new Error('Campus is not configured. Please set VITE_CAMPUS_ID.'))
    }

    const body = {
        name,
        email,
        campusId: resolvedCampusId,
    }
    if (studentId && String(studentId).trim()) {
        body.studentId = String(studentId).trim()
    }

    return apiClient.post('/auth/signup', body)
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
