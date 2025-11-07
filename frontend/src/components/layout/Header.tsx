import { useEffect, useState } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Header() {
    const [user, setUser] = useState<any>(null);
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
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            })();
        }
    }, [token]);

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    return (
        <header style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0
            }}>
            Student Library System
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "#6b7280" }}>
                Welcome, {user?.email} ({user?.role})
            </span>
            {/* Avatar */}
            <div
                onClick={handleAvatarClick}
                style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: user?.avatarUrl ? "transparent" : "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "2px solid #e5e7eb",
                    overflow: "hidden",
                    transition: "border-color 0.2s"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                }}
                title="Click to edit profile"
            >
                {user?.avatarUrl ? (
                    <img
                        src={`${API_BASE}${user.avatarUrl}`}
                        alt="User avatar"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                        onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                                const fallback = document.createElement('span');
                                fallback.style.cssText = `
                                    color: #6b7280; 
                                    font-size: 14px;
                                    font-weight: bold;
                                `;
                                fallback.textContent = user?.email?.charAt(0).toUpperCase() || '?';
                                target.parentElement.appendChild(fallback);
                            }
                        }}
                    />
                ) : (
                    <span style={{ 
                        color: "#6b7280", 
                        fontSize: "14px",
                        fontWeight: "bold"
                    }}>
                        {user?.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                )}
            </div>
            <button
                onClick={logout}
                style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem"
                }}
            >
                Logout
            </button>
            </div>
        </header>
    );
}