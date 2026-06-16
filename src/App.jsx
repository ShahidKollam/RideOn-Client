import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '@/pages/Home'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ProfilePage from '@/pages/ProfilePage'
import AppLayout from '@/components/layout/AppLayout'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/signup" element={<SignupPage />} />
                    <Route path="/auth/profile" element={<ProfilePage />} />
                    <Route path="/auth/complete-profile" element={<ProfilePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}