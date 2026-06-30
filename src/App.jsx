import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '@/pages/Home'
import LoginPage from '@/pages/LoginPage'
import Signup from '@/pages/Signup'
import AppLayout from '@/components/layout/AppLayout'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/signup" element={<Signup />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
