import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { Building, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (token: string) => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const payload = isLogin
        ? { email, password }
        : { email, password, name };

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      if (isLogin) {
        // Success: pass token to parent
        onAuthSuccess(data.access_token);
      } else {
        // Automatically log in after registration
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(loginData.detail || 'Registration succeeded, but automatic login failed.');
        }
        onAuthSuccess(loginData.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-netflix-container">
      <style>{`
        .auth-netflix-container {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-image: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.9) 100%), 
                            url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          overflow-x: hidden;
        }

        .auth-netflix-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 2rem 3.5rem;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .auth-netflix-header {
            padding: 1.5rem;
          }
        }

        .auth-netflix-logo-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: var(--gradient-brand);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .auth-netflix-logo-text {
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -0.04em;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-netflix-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        .auth-netflix-card {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem 2.25rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius);
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          color: white;
        }

        @media (max-width: 480px) {
          .auth-netflix-card {
            padding: 2.5rem 1.5rem;
            background-color: rgba(15, 23, 42, 0.9);
          }
        }

        .auth-netflix-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .auth-netflix-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-netflix-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .auth-netflix-icon {
          position: absolute;
          left: 1rem;
          color: #64748b;
          pointer-events: none;
          zIndex: 10;
        }

        .auth-netflix-input {
          width: 100%;
          height: 50px;
          padding-left: 2.75rem !important;
          background-color: rgba(30, 41, 59, 0.6) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: var(--radius-sm) !important;
          font-size: 0.9rem;
          outline: none;
          transition: var(--transition);
        }

        .auth-netflix-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.25) !important;
          background-color: rgba(30, 41, 59, 0.95) !important;
        }

        .auth-netflix-password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: var(--transition);
          z-index: 12;
        }

        .auth-netflix-password-toggle:hover {
          color: white;
        }

        .auth-netflix-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-sm);
          background-color: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(244, 63, 94, 0.25);
        }

        .auth-netflix-submit {
          width: 100%;
          height: 50px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 0.75rem;
          background: var(--gradient-brand);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
          transition: var(--transition);
        }

        .auth-netflix-submit:hover {
          filter: brightness(1.08);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .auth-netflix-submit:active {
          transform: scale(0.98);
        }

        .auth-netflix-footer {
          padding: 2rem 3.5rem;
          background-color: rgba(15, 23, 42, 0.9);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #64748b;
          font-size: 0.825rem;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .auth-netflix-footer {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Header logo */}
      <header className="auth-netflix-header">
        <div className="auth-netflix-logo-box">
          <Building size={20} color="white" />
        </div>
        <span className="auth-netflix-logo-text">LiviSync</span>
      </header>

      {/* Centered Content Card */}
      <div className="auth-netflix-content">
        <div className="auth-netflix-card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
            {isLogin ? 'to find roommates and premium hostels' : 'Create an account to start syncing'}
          </p>

          {error && (
            <div className="auth-netflix-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-netflix-input-group">
                <label className="auth-netflix-label">Full Name</label>
                <div className="auth-netflix-input-wrapper">
                  <User size={18} className="auth-netflix-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-netflix-input"
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-netflix-input-group">
              <label className="auth-netflix-label">Email Address</label>
              <div className="auth-netflix-input-wrapper">
                <Mail size={18} className="auth-netflix-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-netflix-input"
                  required
                />
              </div>
            </div>

            <div className="auth-netflix-input-group">
              <label className="auth-netflix-label">Password</label>
              <div className="auth-netflix-input-wrapper">
                <Lock size={18} className="auth-netflix-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-netflix-input"
                  style={{ paddingRight: '2.85rem' }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-netflix-password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-netflix-submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Immersive Footer */}
      <footer className="auth-netflix-footer">
        &copy; {new Date().getFullYear()} LiviSync. All rights reserved. Connecting students and hosts globally.
      </footer>
    </div>
  );
};



