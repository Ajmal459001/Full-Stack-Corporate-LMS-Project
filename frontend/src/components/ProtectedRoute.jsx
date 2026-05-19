import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, userRole } = useContext(AuthContext);

    if (!token) {
        // Not logged in? Redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Role not permitted? Redirect to a neutral safe zone
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;