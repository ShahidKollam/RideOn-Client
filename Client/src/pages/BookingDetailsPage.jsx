import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'

/**
 * Deep-link compatibility: /bookings/:id opens My Bookings with the details modal.
 */
export default function BookingDetailsPage() {
    const { id } = useParams()
    if (!id) return <Navigate to="/bookings" replace />
    return <Navigate to={`/bookings?id=${encodeURIComponent(id)}`} replace />
}
