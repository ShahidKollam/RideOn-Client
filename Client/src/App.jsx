import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '@/pages/Home'
import LoginPage from '@/pages/LoginPage'
import Signup from '@/pages/Signup'
import ProfilePage from '@/pages/ProfilePage'
import VerifyMagicLinkPage from '@/pages/VerifyMagicLinkPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import PublicRoute from '@/components/auth/PublicRoute'
import LoadingScreen from '@/components/ui/LoadingScreen'

const VehiclesPage = lazy(() => import('@/pages/VehiclesPage'))
const VehicleDetailsPage = lazy(() => import('@/pages/VehicleDetailsPage'))
const BookingPage = lazy(() => import('@/pages/BookingPage'))
const BookingSuccessPage = lazy(() => import('@/pages/BookingSuccessPage'))
const BookingsPage = lazy(() => import('@/pages/BookingsPage'))
const BookingDetailsPage = lazy(() => import('@/pages/BookingDetailsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/vehicles" element={<Suspense fallback={<LoadingScreen />}><VehiclesPage /></Suspense>} />
                    <Route path="/vehicles/:id" element={<Suspense fallback={<LoadingScreen />}><VehicleDetailsPage /></Suspense>} />
                    <Route path="/booking/:id" element={<ProtectedRoute><Suspense fallback={<LoadingScreen />}><BookingPage /></Suspense></ProtectedRoute>} />
                    <Route path="/booking-success/:id" element={<ProtectedRoute><Suspense fallback={<LoadingScreen />}><BookingSuccessPage /></Suspense></ProtectedRoute>} />
                    <Route path="/bookings" element={<ProtectedRoute><Suspense fallback={<LoadingScreen />}><BookingsPage /></Suspense></ProtectedRoute>} />
                    <Route path="/bookings/:id" element={<ProtectedRoute><Suspense fallback={<LoadingScreen />}><BookingDetailsPage /></Suspense></ProtectedRoute>} />
                    <Route path="/about" element={<Suspense fallback={<LoadingScreen />}><AboutPage /></Suspense>} />
                    <Route path="/contact" element={<Suspense fallback={<LoadingScreen />}><ContactPage /></Suspense>} />

                    <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                    <Route
                        path="/auth/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/auth/signup"
                        element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        }
                    />
                    <Route path="/auth/verify" element={<VerifyMagicLinkPage />} />
                    <Route path="/auth/verify-login-link" element={<VerifyMagicLinkPage />} />
                    <Route
                        path="/auth/complete-profile"
                        element={
                            <ProtectedRoute requireCompletedProfile={false}>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
