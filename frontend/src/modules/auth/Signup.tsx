import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('TestPassword123');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await signup(email, password, role);
      nav('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'ui-sans-serif', padding: '20px' }}>
      <h1>Sign up</h1>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email<br/>
            <input 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              type="email" 
              required 
              placeholder="Enter your email"
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Password<br/>
            <input 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              type="password" 
              required 
              placeholder="Enter your password"
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Role<br/>
            <select 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              value={role} 
              onChange={e=>setRole(e.target.value as 'student' | 'admin')}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </label>
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
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson', marginTop: '15px' }}>{error}</p>}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
