import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from "./ThemeProvider.tsx";

import { AuthProvider } from "./AuthContext";
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="623104516418-jq5fk9kh5nlampb9iofebegjmbels55l.apps.googleusercontent.com">
    <StrictMode>
      <ThemeProvider>
      <AuthProvider>
        {" "}
        <App />
      </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  </GoogleOAuthProvider>
);
