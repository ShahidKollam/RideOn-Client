import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { registerAuthHandlers } from '@/lib/apiClient'
import { logoutStudent, refreshAccessToken } from '@/services/authService'

const TOKEN_KEY = 'rideon_access_token'
const USER_KEY = 'rideon_user'

const AuthContext = createContext(null)

function readStoredUser() {
    try {
        const value = window.localStorage.getItem(USER_KEY)
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [accessToken, setAccessTokenState] = useState(() => window.localStorage.getItem(TOKEN_KEY))
    const [user, setUserState] = useState(readStoredUser)
    const [initializing, setInitializing] = useState(true)

    const setAccessToken = useCallback((token) => {
        setAccessTokenState(token)

        if (token) {
            window.localStorage.setItem(TOKEN_KEY, token)
        } else {
            window.localStorage.removeItem(TOKEN_KEY)
        }
    }, [])

    const setUser = useCallback((nextUser) => {
        setUserState(nextUser)

        if (nextUser) {
            window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
        } else {
            window.localStorage.removeItem(USER_KEY)
        }
    }, [])

    const clearSession = useCallback(() => {
        setAccessToken(null)
        setUser(null)
    }, [setAccessToken, setUser])

    useEffect(() => {
        registerAuthHandlers({
            getAccessToken: () => window.localStorage.getItem(TOKEN_KEY),
            setAccessToken,
            onUnauthorized: clearSession,
        })
    }, [clearSession, setAccessToken])

    useEffect(() => {
        let active = true

        async function restoreSession() {
            try {
                const response = await refreshAccessToken()
                const token = response.data?.data?.accessToken

                if (token && active) {
                    setAccessToken(token)
                }
            } catch {
                if (active) {
                    clearSession()
                }
            } finally {
                if (active) {
                    setInitializing(false)
                }
            }
        }

        restoreSession()

        return () => {
            active = false
        }
    }, [clearSession, setAccessToken])

    const login = useCallback((token, nextUser) => {
        setAccessToken(token)
        setUser(nextUser)
    }, [setAccessToken, setUser])

    const updateUser = useCallback((nextUser) => {
        setUser(nextUser)
    }, [setUser])

    const logout = useCallback(async () => {
        try {
            await logoutStudent()
        } finally {
            clearSession()
        }
    }, [clearSession])

    const value = useMemo(() => ({
        accessToken,
        user,
        initializing,
        isAuthenticated: Boolean(accessToken),
        login,
        logout,
        clearSession,
        updateUser,
    }), [accessToken, clearSession, initializing, login, logout, updateUser, user])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
