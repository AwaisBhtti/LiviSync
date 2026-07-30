import type React from 'react';

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80';

export const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
};

export const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  position: 'relative',
};

export const headerStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const pageHeaderStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.75rem',
  marginBottom: '1rem',
};

export const tableContainerStyle: React.CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  maxHeight: '400px',
  overflowY: 'auto',
};

export const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

export const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '2px solid var(--border)',
};

export const thStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  padding: '0.75rem 1rem',
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--card)',
  zIndex: 10,
};

export const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
};

export const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
  verticalAlign: 'middle',
};

export const smallAvatarStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  objectFit: 'cover',
};

export const tableBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  gap: '0.25rem',
};

export const statCardStyle: React.CSSProperties = {
  padding: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

export const statLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  fontWeight: 500,
  letterSpacing: '0.05em',
};

export const statValueStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  marginTop: '0.25rem',
};

