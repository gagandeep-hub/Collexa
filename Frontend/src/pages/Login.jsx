import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Navigate to the page the user tried to access before being redirected to login
    const from = location.state?.from?.pathname || '/';

    // React race condition fix: wait for the user state to actually update in context
    // before navigating. If we navigate immediately after login(), AdminRoute might
    // mount while context still thinks the user is null, causing an instant bounce back.
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        }
    }, [user, navigate, from]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('Login successful!');
            // Redirection is handled by the useEffect above
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    // GoogleLoginButton triggers loginWithGoogle, which updates context.
    // The useEffect above will handle the redirection.
    const handleGoogleSuccess = () => {
        // Redirection handled by useEffect
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Welcome Back!</h1>
                    <p>Login to continue buying and selling</p>
                </div>

                {/* ─── Email / Password Form ─────────────────────────────── */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* ─── Divider ──────────────────────────────────────────────── */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* ─── Google OAuth ─────────────────────────────────────────── */}
                <GoogleLoginButton onSuccess={handleGoogleSuccess} />

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
