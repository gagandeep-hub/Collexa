import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — a double-layer guard:
 *   1. If not authenticated → redirect to /login
 *   2. If authenticated but not admin → redirect to / with a 403 state
 *
 * Usage: wrap any admin page with <AdminRoute> in App.jsx
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading" style={{ height: '100vh' }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" state={{ forbidden: true }} replace />;
    }

    return children;
};

export default AdminRoute;
