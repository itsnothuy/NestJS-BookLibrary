import { useEffect, useState } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const [avatarError, setAvatarError] = useState(false);
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            (async () => {
                try {
                    const res = await fetch(`${API_BASE}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const profile = await res.json();
                        setUser(profile);
                        setAvatarError(false); // Reset avatar error state
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            })();
        }
    }, [token]);

    // Add effect to listen for profile refresh events
    useEffect(() => {
        const handleProfileRefresh = (event: CustomEvent) => {
            // Use profile data from event detail if available, otherwise fetch
            if (event.detail) {
                setUser(event.detail);
                setAvatarError(false);
            } else if (token) {
                // Fallback to fetching if no data provided
                fetch(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.json()).then(profile => {
                    setUser(profile);
                    setAvatarError(false);
                }).catch(error => {
                    console.error('Failed to refresh profile:', error);
                });
            }
        };

        // Listen for custom profile refresh event
        window.addEventListener('profile-updated', handleProfileRefresh as EventListener);
        return () => window.removeEventListener('profile-updated', handleProfileRefresh as EventListener);
    }, [token]);

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    return (
        <header className="header">
            <h1 className="header-title">
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