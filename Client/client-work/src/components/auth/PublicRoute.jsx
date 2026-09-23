import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function PublicRoute({ children }) {
    const { isAuthenticated, initializing } = useAuth()

    if (initializing) {
        return <LoadingScreen message="Loading RideOn..." />
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return children
}