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
import ScrollToTop from '@/components/layout/ScrollToTop'

const VehiclesPage = lazy(() => import('@/pages/VehiclesPage'))
const VehicleDetailsPage = lazy(() => import('@/pages/VehicleDetailsPage'))
const BookingPage = lazy(() => import('@/pages/BookingPage'))
const BookingSuccessPage = lazy(() => import('@/pages/BookingSuccessPage'))
const BookingsPage = lazy(() => import('@/pages/BookingsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const PaymentFailedPage = lazy(() => import('@/pages/PaymentFailedPage'))
const CancellationPolicyPage = lazy(() => import('@/pages/CancellationPolicyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'))

/** Shared Suspense boundary for lazy route modules */
function LazyPage({ children }) {
    return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/vehicles" element={<LazyPage><VehiclesPage /></LazyPage>} />
                    <Route path="/vehicles/:id" element={<LazyPage><VehicleDetailsPage /></LazyPage>} />
                    <Route path="/pricing" element={<LazyPage><PricingPage /></LazyPage>} />
                    <Route
                        path="/booking"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <BookingPage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/booking/:id"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <BookingPage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/booking-success/:id"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <BookingSuccessPage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment-failed"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <PaymentFailedPage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bookings"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <BookingsPage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bookings/:id"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <BookingsPage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <LazyPage>
                                    <UserProfilePage />
                                </LazyPage>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/about" element={<LazyPage><AboutPage /></LazyPage>} />
                    <Route path="/contact" element={<LazyPage><ContactPage /></LazyPage>} />
                    <Route path="/cancellation-policy" element={<LazyPage><CancellationPolicyPage /></LazyPage>} />
                    <Route path="/terms" element={<LazyPage><TermsPage /></LazyPage>} />
                    <Route path="/privacy" element={<LazyPage><PrivacyPage /></LazyPage>} />
                    <Route path="/faq" element={<LazyPage><FaqPage /></LazyPage>} />

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
