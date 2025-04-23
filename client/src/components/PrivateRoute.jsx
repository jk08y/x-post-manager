// client/src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, authError } = useAuth();
  
  // If there's an unauthorized error, redirect to unauthorized page
  if (authError === "unauthorized") {
    return <Navigate to="/unauthorized" />;
  }
  
  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If logged in and authorized, render the child routes
  return <Outlet />;
};

export default PrivateRoute;