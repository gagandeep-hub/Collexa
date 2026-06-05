import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useState } from 'react';

/**
 * GoogleLoginButton
 *
 * Why this component exists:
 *  - Encapsulates all Google login logic in one place
 *  - Reusable on both Login and Register pages without duplicating code
 *  - Uses the "popup" flow (useGoogleLogin with flow: 'implicit') which returns
 *    an access token, but we actually need the ID token. We use the credential
 *    flow via CredentialResponse instead.
 *
 * We use the @react-oauth/google's GoogleLogin component's onSuccess callback
 * which directly gives us the credential (ID token) string — exactly what
 * the backend expects.
 *
 * @param {string} label - Button label text (defaults to "Continue with Google")
 * @param {function} onSuccess - Optional callback after successful login
 */

import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess }) => {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    /**
     * Called by @react-oauth/google when the user selects a Google account.
     * `credentialResponse.credential` is the raw Google ID token (JWT string).
     * We send it to our backend which verifies it with google-auth-library.
     */
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            await loginWithGoogle(credentialResponse.credential);
            toast.success('Logged in with Google!');
            if (onSuccess) onSuccess();
        } catch (error) {
            const message = error.response?.data?.message || 'Google sign-in failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google sign-in was cancelled or failed. Please try again.');
    };

    return (
        <div className="google-login-wrapper">
            {loading ? (
                // Show a disabled placeholder while the API call is in-flight
                <button className="google-btn google-btn--loading" disabled>
                    <span className="google-btn__spinner"></span>
                    Signing in...
                </button>
            ) : (
                /**
                 * GoogleLogin renders Google's official button.
                 * We use theme="outline" and shape="rectangular" to get a clean
                 * button that we can style to match our design via CSS overrides.
                 *
                 * useOneTap={false} — disables the one-tap overlay which can be
                 * intrusive and confusing in a multi-auth context.
                 */
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    shape="rectangular"
                    size="large"
                    width="100%"
                    text="continue_with"
                />
            )}
        </div>
    );
};

export default GoogleLoginButton;
