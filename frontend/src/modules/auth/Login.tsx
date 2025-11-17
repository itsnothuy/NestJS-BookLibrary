import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('1234');
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
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <div className="login-form-group">
          <label>Email<br/>
            <input 
              className="login-input"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              type="email" 
              required 
              placeholder="Enter your email"
            />
          </label>
        </div>
        
        <div className="login-form-group-bottom">
          <label>Password<br/>
            <input 
              className="login-input"
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
          className="login-button"
        >
          {busy ? 'Logging in…' : 'Login'}
        </button>
      </form>
      {error && <p className="login-error">{error}</p>}
      <p className="login-footer">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}
