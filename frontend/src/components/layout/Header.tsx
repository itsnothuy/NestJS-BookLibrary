import { useState } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Header() {
    const [avatarError, setAvatarError] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Remove the problematic useEffect that fetches /auth/me
    // User data now comes from AuthContext

    // useEffect(() => {
    //     const handleProfileRefresh = (event: CustomEvent) => {
    //         // Use profile data from event detail if available, otherwise fetch
    //         if (event.detail) {
    //             setUser(event.detail);
    //             setAvatarError(false);
    //         } else if (token) {
    //             // Fallback to fetching if no data provided
    //             fetch(`${API_BASE}/auth/me`, {
    //                 headers: { Authorization: `Bearer ${token}` }
    //             }).then(res => res.json()).then(profile => {
    //                 setUser(profile);
    //                 setAvatarError(false);
    //             }).catch(error => {
    //                 console.error('Failed to refresh profile:', error);
    //             });
    //         }
    //     };
    //     // Listen for custom profile refresh event
    //     window.addEventListener('profile-updated', handleProfileRefresh as EventListener);
    //     return () => window.removeEventListener('profile-updated', handleProfileRefresh as EventListener);
    // }, [token]);

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    const handleTitleClick = () => {
        // Navigate to home based on user role
        if (user?.role === 'admin') {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <header className="header">
            <h1 
                className="header-title"
                onClick={handleTitleClick}
                style={{ cursor: 'pointer' }}
                title={user?.role === 'admin' ? 'Go to Dashboard' : 'Go to Home'}
            >
                Student Library System
            </h1>
            <div className="header-user-section">
                <span className="header-welcome-text">
                    Welcome, {user?.email} ({user?.role})
                </span>
                {/* Avatar */}
                <div
                    onClick={handleAvatarClick}
                    className="header-avatar"
                    title="Click to edit profile"
                >
                    {user?.avatarUrl && !avatarError ? (
                        <img
                            src={`${API_BASE}${user.avatarUrl}`}
                            alt="User avatar"
                            className="header-avatar-img"
                            onError={() => {
                                console.log('Avatar failed to load:', `${API_BASE}${user.avatarUrl}`);
                                setAvatarError(true);
                            }}
                        />
                    ) : (
                        <span className="header-avatar-fallback">
                            {user?.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                    )}
                </div>
                <button
                    onClick={logout}
                    className="header-logout-button"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}