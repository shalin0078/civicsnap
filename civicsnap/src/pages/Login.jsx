import { useState } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CivicLogo from '../components/CivicLogo';
import { useToast } from '../components/Toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://civicsnap-backend-cbsd.onrender.com';
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json();

      if (res.ok) {
        const isAdmin = Boolean(data.role === 'authority' || cleanEmail === 'admin@civicsnap.com');
        const role = isAdmin ? 'authority' : 'citizen';
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', cleanEmail);
        localStorage.setItem('userName', data.username || (isAdmin ? 'Municipal Admin' : 'Citizen'));
        localStorage.setItem('userRole', role);

        showToast(
          isAdmin ? 'Signed in to Admin Dashboard.' : 'Signed in successfully. Welcome to CivicSnap.', 
          'success', 
          isAdmin ? 'Admin Portal' : 'Authenticated'
        );
        navigate('/dashboard');
      } else {
        showToast(data.message || 'Invalid email or password. Please verify credentials.', 'error', 'Sign In Failed');
      }
    } catch {
      // Fallback for pre-configured accounts when offline
      if (cleanEmail === 'admin@civicsnap.com' && password === 'admin123') {
        localStorage.setItem('userId', 'demo-admin-id');
        localStorage.setItem('userEmail', cleanEmail);
        localStorage.setItem('userName', 'Municipal Admin');
        localStorage.setItem('userRole', 'authority');
        showToast('Signed in to Admin Dashboard.', 'success', 'Admin Portal');
        navigate('/dashboard');
        return;
      }
      if (cleanEmail === 'user@civicsnap.com' && password === 'password123') {
        localStorage.setItem('userId', 'demo-user-id');
        localStorage.setItem('userEmail', cleanEmail);
        localStorage.setItem('userName', 'John Citizen');
        localStorage.setItem('userRole', 'citizen');
        showToast('Signed in successfully.', 'success', 'Session Active');
        navigate('/dashboard');
        return;
      }
      showToast('Unable to reach authentication service. Please check your connection.', 'error', 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-viewport">
      <div className="auth-ambient-glow"></div>
      
      <div className="auth-top-nav">
        <Link to="/" className="btn-back-home">
          <ArrowLeft size={16} />
          <span>Back to Homepage</span>
        </Link>
      </div>

      <div className="auth-wrapper">
        <div className="auth-card-modern">
          {/* Brand Header */}
          <div className="auth-brand-badge">
            <CivicLogo size={36} />
            <span className="auth-logo-name">CivicSnap</span>
          </div>

          <div className="auth-header-text">
            <h2>Welcome Back</h2>
            <p>Sign in to your civic dashboard to monitor and report neighborhood issues.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-modern">
            <div className="field-group">
              <label htmlFor="email">Email Address</label>
              <div className="field-input-box">
                <Mail className="field-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-label-split">
                <label htmlFor="password">Password</label>
                <a href="#!" className="forgot-link">Forgot password?</a>
              </div>
              <div className="field-input-box">
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-submit interactive-hover" disabled={loading}>
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer Link */}
          <div className="auth-footer-nav">
            <p>New to CivicSnap? <Link to="/register" className="switch-auth-link">Create an account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
