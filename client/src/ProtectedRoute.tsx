import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Use the global auth context

const ProtectedRoute: React.FC = () => {
  const { auth } = useAuth(); // Get the authentication status

  // If the user is authenticated, render the child routes
  // Otherwise, redirect to the login page
  return auth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
