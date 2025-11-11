import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

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
    <div className="signup-container">
      <h1>Sign up</h1>
      <form onSubmit={onSubmit}>
        <div className="signup-form-group">
          <label>Email<br/>
            <input 
              className="signup-input"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              type="email" 
              required 
              placeholder="Enter your email"
            />
          </label>
        </div>
        
        <div className="signup-form-group">
          <label>Password<br/>
            <input 
              className="signup-input"
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              type="password" 
              required 
              placeholder="Enter your password"
            />
          </label>
        </div>
        
        <div className="signup-form-group-bottom">
          <label>Role<br/>
            <select 
              className="signup-select"
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
          className="signup-button"
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      {error && <p className="signup-error">{error}</p>}
      <p className="signup-footer">
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
