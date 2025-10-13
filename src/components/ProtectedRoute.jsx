import React from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ProtectedRoute({ diff = false, children }) {
  const { user, loading } = UserAuth();
  if (loading)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <FontAwesomeIcon
          icon="fa-solid fa-spinner"
          size="2xl"
          className="animate-spin text-white"
        />
      </div>
    );
  if (diff) return !user ? children : <Navigate to="/trang-chu" />;
  return user ? children : <Navigate to="/trang-chu" />;
}

export default ProtectedRoute;
