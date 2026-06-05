import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * On app load, if a JWT exists in localStorage we validate it by hitting /me.
     * This handles page refreshes — the user stays logged in.
     * Works for both local and Google-authenticated users (same JWT format).
     */
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await authAPI.getMe();
                setUser(res.data.user);
            } catch (error) {
                // Token is expired or invalid — clean up
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    /**
     * Email + password login.
     * Stores JWT and sets user state — same pattern for all auth methods.
     */
    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    /**
     * Email + password registration.
     */
    const register = async (userData) => {
        const res = await authAPI.register(userData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    /**
     * Google OAuth authentication.
     *
     * The `credential` is the raw ID token string returned by Google's popup
     * (from the `onSuccess` callback of useGoogleLogin).
     *
     * After calling this, the user is authenticated using our own JWT —
     * not Google's token. Google's token is only used for the initial verification.
     *
     * This function is intentionally identical in shape to login() and register()
     * so any UI code can handle all three the same way.
     */
    const loginWithGoogle = async (credential) => {
        const res = await authAPI.googleAuth(credential);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    /**
     * Clears local auth state.
     * Works for both local and Google users — no Google-specific logout needed
     * because we use our own JWTs, not Google sessions.
     */
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    /**
     * Updates the user object in the global state.
     * Useful when the user updates their profile and we want the changes reflected instantly.
     */
    const updateUserContext = (updatedUser) => {
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserContext,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
