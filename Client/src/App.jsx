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

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />

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
                            // <ProtectedRoute requireCompletedProfile={false}>
                                <ProfilePage />
                            // </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
