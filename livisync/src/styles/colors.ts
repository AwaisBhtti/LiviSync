/** Centralized color constants for LiviSync – Warm Sand & Cashmere palette. */

export const colors = {
  // Brand Gradients
  gradientBrand: 'linear-gradient(135deg, #b55c3c 0%, #9e4d31 100%)',

  // Status Colors
  success: '#059669',
  successBg: '#ecfdf5',
  successBorder: 'rgba(5, 150, 105, 0.15)',

  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: 'rgba(217, 119, 6, 0.15)',

  danger: '#f43f5e',
  dangerBg: '#fff1f2',
  dangerBorder: 'rgba(244, 63, 94, 0.15)',

  // Warm Sand & Cashmere Light Theme
  light: {
    background:   '#faf8f5',    // ultra-light cashmere/sand
    foreground:   '#332721',    // warm deep espresso brown
    card:         '#f0ece6',    // creamy warm linen beige
    border:       '#e0d6cb',    // soft linen border
    muted:        '#8c7b70',    // warm beige muted
    secondary:    '#e8e3da',    // warm sand hover
    primary:      '#b55c3c',    // muted terracotta rose
    primaryHover: '#9e4d31',
  },

  // Auth Screen — espresso-tinted glass over photo backdrop
  dark: {
    bg:          '#332721',
    bgGradient:  'linear-gradient(160deg, #332721 0%, #1e0e0a 55%, #120806 100%)',
    card:        'rgba(51, 39, 33, 0.72)',
    border:      'rgba(240, 236, 230, 0.18)',
    text:        '#faf8f5',
    muted:       '#c8b8ad',
    surface:     'rgba(51, 39, 33, 0.85)',
    overlay:     'rgba(51, 39, 33, 0.90)',
    inputBg:     'rgba(250, 248, 245, 0.10)',
    inputBorder: 'rgba(240, 236, 230, 0.20)',
  },

  // Backward-compat alias for Roommate Finder — maps to the light palette
  roommateMinimal: {
    bg:           '#faf8f5',
    bgGradient:   'linear-gradient(180deg, #faf8f5 0%, #f0ece6 100%)',
    card:         '#f0ece6',
    border:       '#e0d6cb',
    text:         '#332721',
    muted:        '#8c7b70',
    surface:      '#f0ece6',
    overlay:      'rgba(51, 39, 33, 0.30)',
    inputBg:      '#faf8f5',
    inputBorder:  '#e0d6cb',
    headerBg:     '#f0ece6',
    trackBg:      '#e8e3da',
    successText:  '#059669',
    successBg:    '#ecfdf5',
    successBorder:'rgba(5, 150, 105, 0.15)',
    warningText:  '#d97706',
    warningBg:    '#fffbeb',
    warningBorder:'rgba(217, 119, 6, 0.15)',
  },
};
