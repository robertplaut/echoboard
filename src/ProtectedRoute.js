// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, isAuthenticating, children }) => {
  // 1. If the app is in the middle of trying to log the user in,
  //    show a generic loading message.
  if (isAuthenticating) {
    return <div>Loading...</div>;
  }

  // 2. If authentication is finished AND there is still no user,
  //    it's safe to redirect to the login page.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. If authentication is finished and there IS a user,
  //    render the child components.
  return children;
};

export default ProtectedRoute;
