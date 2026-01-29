import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from './App.jsx'
import './index.css'

const root = document.documentElement;

// Restore theme
if (localStorage.theme === "dark") {
  root.classList.add("dark");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="562440999072-gfonr0hgd4gr9ats504n022es60fghgi.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
