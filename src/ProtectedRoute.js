// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  // If there is no user object, redirect the user to the login page ('/').
  // The 'replace' prop is important; it replaces the current entry in the
  // history stack instead of pushing a new one. This prevents the user from
  // clicking the "back" button and ending up in a broken state.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If there is a user, render the child components that were passed in.
  return children;
};

export default ProtectedRoute;
