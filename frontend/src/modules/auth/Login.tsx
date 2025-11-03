import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('TestPassword123');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'ui-sans-serif', padding: '20px' }}>
      <h1>Login</h1>
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
        
        <div style={{ marginBottom: '20px' }}>
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
          {busy ? 'Logging in…' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson', marginTop: '15px' }}>{error}</p>}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}
