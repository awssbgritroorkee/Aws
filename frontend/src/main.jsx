// Minimalist Developer Signature Badge
const nameStyle = "color: #ffffff; font-size: 12px; font-weight: bold; background: #1a1a1a; padding: 4px 8px; border-radius: 4px 0 0 4px; font-family: sans-serif;";
const roleStyle = "color: #ffffff; font-size: 12px; font-weight: bold; background: #007bff; padding: 4px 8px; border-radius: 0 4px 4px 0; font-family: sans-serif;";

console.log(
  "%cBuilt & Engineered by Rahul Kumar%cTech Lead",
  nameStyle,
  roleStyle
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047120194829-demoappsbg.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
