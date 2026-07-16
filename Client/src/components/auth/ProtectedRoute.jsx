import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function ProtectedRoute({ children, requireCompletedProfile = true }) {
    const { initializing, isAuthenticated, user } = useAuth()
    const location = useLocation()

    if (initializing) {
        return <LoadingScreen message="Loading RideOn..." />
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />
    }

    if (
        requireCompletedProfile &&
        user?.onboardingStatus === 'EMAIL_VERIFIED' &&
        location.pathname !== '/auth/complete-profile'
    ) {
        return <Navigate to="/auth/complete-profile" replace />
    }

    return children
}
