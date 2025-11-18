import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const API_BASE = import.meta.env.VITE_API_BASE;

export default function Profile() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
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
            setEmail(profile.email);
            if (profile.avatarUrl) {
              setAvatarPreview(`${API_BASE}${profile.avatarUrl}`);
              setAvatarError(false);
            } else {
              setAvatarPreview(null);
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          setError('Failed to load profile');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [token]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
        setAvatarError(false); // Reset error state for new preview
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      if (password && password !== confirmPassword) {
        setError('Passwords do not match');
        setBusy(false);
        return;
      }

      if (email !== user?.email || password) {
        const profileData: any = {};
        if (email !== user?.email) profileData.email = email;
        if (password) profileData.password = password;

        const profileRes = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (!profileRes.ok) {
          const errorData = await profileRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update profile');
        }
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const avatarRes = await fetch(`${API_BASE}/auth/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!avatarRes.ok) {
          const errorData = await avatarRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload avatar');
        }
      }
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
      
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
        setEmail(profile.email);
        if (profile.avatarUrl) {
          setAvatarPreview(`${API_BASE}${profile.avatarUrl}`);
          setAvatarError(false);
        } else {
          setAvatarPreview(null);
        }
        
        // Dispatch event to notify other components about profile update
        window.dispatchEvent(new CustomEvent('profile-updated'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'ui-sans-serif', padding: '20px', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'ui-sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Profile</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Avatar Upload */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
            Profile Picture
          </label>
          <div style={{ marginBottom: '10px' }}>
            {avatarPreview && !avatarError ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e5e7eb'
                }}
                onError={() => {
                  console.log('Avatar preview failed to load:', avatarPreview);
                  setAvatarError(true);
                }}
              />
            ) : (
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '2px solid #e5e7eb',
                  color: '#6b7280'
                }}
              >
                {avatarError ? user?.email?.charAt(0).toUpperCase() || '?' : 'No Image'}
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          <small style={{ color: '#6b7280', fontSize: '12px' }}>
            Max size: 5MB. Supported formats: JPG, PNG, GIF
          </small>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '15px' }}>
          <label>Email<br/>
            <input 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              type="email" 
              required 
              placeholder="Enter your email"
            />
          </label>
        </div>
        
        {/* Password */}
        <div style={{ marginBottom: '15px' }}>
          <label>New Password (leave blank to keep current)<br/>
            <input 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              type="password" 
              placeholder="Enter new password"
            />
          </label>
        </div>

        {/* Confirm Password */}
        {password && (
          <div style={{ marginBottom: '20px' }}>
            <label>Confirm New Password<br/>
              <input 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                type="password" 
                placeholder="Confirm new password"
                required
              />
            </label>
          </div>
        )}

        {/* Role */}
        <div style={{ marginBottom: '20px' }}>
          <label>Role<br/>
            <input 
              style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f9fafb' }}
              value={user?.role || ''}
              disabled
              readOnly
            />
          </label>
          <small style={{ color: '#6b7280', fontSize: '12px' }}>
            Role cannot be changed
          </small>
        </div>
        
        <button 
          disabled={busy} 
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: busy ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          {busy ? 'Updating...' : 'Update Profile'}
        </button>

        <button 
          type="button"
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </form>

      {error && <p style={{ color: 'crimson', marginTop: '15px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '15px' }}>{success}</p>}
    </div>
  );
}