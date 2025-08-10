import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(UserContext);

  if (loading) {
    // You can replace this with a loading spinner or a splash screen
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-lg"></span></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
