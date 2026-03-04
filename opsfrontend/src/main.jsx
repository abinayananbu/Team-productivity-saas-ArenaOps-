import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <GoogleOAuthProvider clientId="562440999072-gfonr0hgd4gr9ats504n022es60fghgi.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
