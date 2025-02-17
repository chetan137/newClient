import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Define User Interface
interface User {
  _id: string;
  email: string;
  username?: string;
  googleId?: string;
}

interface AuthContextType {
  auth: boolean;
  user: User | null;
  setAuth: (auth: boolean, user?: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuthState] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // ✅ Fetch authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking authentication status...");
        const response = await axios.get(
          "http://localhost:5000/api/check-auth",
          {
            withCredentials: true, // ✅ Ensures session cookie is sent
          }
        );

        console.log("✅ Auth response:", response.data);
        setAuthState(response.data.isAuthenticated);
        setUser(response.data.user);
      } catch (error: any) {
        console.error("❌ Error checking auth:", error);

        // 🔹 Log Backend Response
        if (error.response) {
          console.error("Backend response data:", error.response.data);
          console.error("Backend response status:", error.response.status);
        }

        setAuthState(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  // ✅ Update authentication state
  const setAuth = (auth: boolean, user?: User | null) => {
    setAuthState(auth);
    setUser(user || null);
  };

  return (
    <AuthContext.Provider value={{ auth, user, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Ensure useAuth() is only used inside AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
