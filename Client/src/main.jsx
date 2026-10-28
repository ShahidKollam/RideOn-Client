import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <>
        <ToastProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ToastProvider>
    </>
    //  </StrictMode>
)

// If the tree fails to mount, still clear the HTML splash so the page is not stuck
if (typeof window !== 'undefined') {
    window.addEventListener('error', () => {
        if (typeof window.__RIDEON_HIDE_SPLASH__ === 'function') {
            window.__RIDEON_HIDE_SPLASH__()
        }
    })
}
