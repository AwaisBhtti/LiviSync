import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { Building, Mail, Lock, User, AlertCircle } from 'lucide-react';

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
    <div style={containerStyle}>
      <style>{`
        .auth-input {
          padding-left: 2.5rem !important;
          background-color: var(--card) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
        }
      `}</style>
      <div className="card" style={cardStyle}>
        <div style={logoHeaderStyle}>
          <div style={logoIconStyle}>
            <Building size={28} color="white" />
          </div>
          <h2 style={logoTextStyle}>LiviSync</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {isLogin ? 'Welcome back! Sign in to find roommates' : 'Create an account to get started'}
          </p>
        </div>

        {error && (
          <div style={errorContainerStyle}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          {!isLogin && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputWrapperStyle}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input auth-input"
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input auth-input"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input auth-input"
                style={inputStyle}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={submitButtonStyle} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={footerStyle}>
          <span style={{ color: 'var(--muted)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={toggleButtonStyle}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Styles matching modern aesthetics
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '1rem',
  backgroundColor: 'var(--background)',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  padding: '2.5rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  backgroundColor: 'var(--card)',
  boxShadow: 'var(--shadow)',
};

const logoHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  marginBottom: '2rem',
};

const logoIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  backgroundColor: 'var(--primary)',
  marginBottom: '1rem',
  boxShadow: 'var(--shadow-sm)',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '700',
  letterSpacing: '-0.03em',
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius)',
  backgroundColor: 'var(--danger-bg)',
  color: 'var(--danger)',
  fontSize: '0.875rem',
  marginBottom: '1.25rem',
  border: '1px solid #fee2e2',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--foreground)',
};

const inputWrapperStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.75rem',
  color: 'var(--muted)',
  pointerEvents: 'none',
  zIndex: 10,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
};

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '0.5rem',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.375rem',
  marginTop: '2rem',
  fontSize: '0.875rem',
};

const toggleButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'var(--primary)',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'underline',
};
