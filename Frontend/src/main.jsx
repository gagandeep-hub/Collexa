import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

/**
 * GoogleOAuthProvider must wrap the entire app so that:
 *  - The Google Identity Services script is loaded once at startup
 *  - The useGoogleLogin() hook is accessible in any component (Login, Register, etc.)
 *  - The clientId is configured in one place — read from the .env file
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
