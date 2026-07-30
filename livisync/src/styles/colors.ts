/** Centralized color constants for LiviSync. */

export const colors = {
  // Brand Gradients
  gradientBrand: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
  
  // Status Colors
  success: '#10b981', // Emerald 500
  successBg: '#ecfdf5',
  successBorder: 'rgba(16, 185, 129, 0.2)',
  
  warning: '#d97706', // Amber 600
  warningBg: '#fffbeb',
  warningBorder: 'rgba(217, 119, 6, 0.2)',
  
  danger: '#f43f5e', // Rose 500
  dangerBg: '#fff1f2',
  dangerBorder: 'rgba(244, 63, 94, 0.2)',

  // Light Mode Scoped Colors (matches index.css :root variables)
  light: {
    background: '#f8fafc',
    foreground: '#0f172a',
    card: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(226, 232, 240, 0.7)',
    muted: '#64748b',
    secondary: '#f1f5f9',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
  },

  // Premium Dark Navy Scoped Colors (for Auth Screen & Roommate Finder)
  dark: {
    bg: '#0f172a', // Slate 900
    bgGradient: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
    card: 'rgba(30, 41, 59, 0.6)', // Slate 800 glass
    border: 'rgba(255, 255, 255, 0.07)',
    text: '#f1f5f9',
    muted: '#94a3b8',
    surface: 'rgba(30, 41, 59, 0.7)',
    overlay: 'rgba(15, 23, 42, 0.9)',
    inputBg: 'rgba(15, 23, 42, 0.5)',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
  }
};
