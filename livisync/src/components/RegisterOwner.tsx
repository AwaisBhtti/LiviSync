import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, User, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterOwner = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/auth/verify-invite/${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Invitation link is invalid or expired.');
        }

        setEmail(data.email);
        setTokenValid(true);
      } catch (err: any) {
        setError(err.message || 'Verification failed.');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setError('Invite token is missing.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={containerStyle}>
        <div className="card" style={cardStyle}>
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Verifying invite token...</p>
        </div>
      </div>
    );
  }

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
          <h2 style={logoTextStyle}>Hostel Owner Registration</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem', textAlign: 'center' }}>
            Complete registration using your official invite
          </p>
        </div>

        {error && (
          <div style={errorContainerStyle}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={successContainerStyle}>
            <CheckCircle size={32} color="var(--success)" />
            <h4 style={{ marginTop: '0.75rem' }}>Registration Successful!</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem', textAlign: 'center' }}>
              Your profile is pending activation by the system administrator. You will be redirected to the login page shortly.
            </p>
          </div>
        ) : tokenValid ? (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Invited Email (Read Only)</label>
              <div style={inputWrapperStyle}>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="form-input auth-input"
                  style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputWrapperStyle}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="e.g. Malik Ahmad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              {loading ? 'Registering...' : 'Register Profile'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
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
  maxWidth: '440px',
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
  fontSize: '1.4rem',
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

const successContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem 0',
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
