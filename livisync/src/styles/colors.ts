/** Centralized color constants for LiviSync – Organic (cream, terracotta & sage) palette. */

export const colors = {
  // Brand Gradients
  gradientBrand: 'linear-gradient(135deg, #c67139 0%, #b2622d 100%)',

  // Status Colors — drawn from the sage / terracotta ramps
  success: '#56633f',
  successBg: '#f0fae1',
  successBorder: 'rgba(86, 99, 63, 0.20)',

  warning: '#8c491a',
  warningBg: '#fff2eb',
  warningBorder: 'rgba(140, 73, 26, 0.20)',

  danger: '#a33b2a',
  dangerBg: '#fdeee9',
  dangerBorder: 'rgba(163, 59, 42, 0.18)',

  // Organic light theme
  light: {
    background:   '#f5ead8',    // cream ground
    foreground:   '#201e1d',    // near-black ink
    card:         '#ebddc5',    // sand surface
    border:       '#dcd3c4',    // soft neutral border
    muted:        '#82796a',    // warm muted text
    secondary:    '#eee7db',    // light neutral hover
    primary:      '#c67139',    // terracotta accent
    primaryHover: '#b2622d',
    accent2:      '#7a8a5e',    // sage second voice
  },

  // Auth Screen — ink-tinted glass over photo backdrop
  dark: {
    bg:          '#201e1d',
    bgGradient:  'linear-gradient(160deg, #2e2b25 0%, #201e1d 55%, #120f0d 100%)',
    card:        'rgba(32, 30, 29, 0.72)',
    border:      'rgba(245, 234, 216, 0.18)',
    text:        '#f5ead8',
    muted:       '#c0b6a5',
    surface:     'rgba(32, 30, 29, 0.85)',
    overlay:     'rgba(32, 30, 29, 0.90)',
    inputBg:     'rgba(245, 234, 216, 0.10)',
    inputBorder: 'rgba(245, 234, 216, 0.20)',
  },

  // Backward-compat alias for Roommate Finder — maps to the light palette
  roommateMinimal: {
    bg:           '#f5ead8',
    bgGradient:   'linear-gradient(180deg, #f5ead8 0%, #ebddc5 100%)',
    card:         '#ebddc5',
    border:       '#dcd3c4',
    text:         '#201e1d',
    muted:        '#82796a',
    surface:      '#ebddc5',
    overlay:      'rgba(32, 30, 29, 0.30)',
    inputBg:      '#f5ead8',
    inputBorder:  '#dcd3c4',
    headerBg:     '#ebddc5',
    trackBg:      '#eee7db',
    successText:  '#56633f',
    successBg:    '#f0fae1',
    successBorder:'rgba(86, 99, 63, 0.20)',
    warningText:  '#8c491a',
    warningBg:    '#fff2eb',
    warningBorder:'rgba(140, 73, 26, 0.20)',
  },
};

/** Organic tonal ramps — same step of any ramp carries the same visual weight. */
export const ramps = {
  neutral: ['#f9f4ed', '#eee7db', '#dcd3c4', '#c0b6a5', '#a19786', '#82796a', '#645c50', '#474238', '#2e2b25'],
  accent:  ['#fff2eb', '#ffe1d0', '#ffc6a5', '#f6a06b', '#d67f48', '#b2622d', '#8c491a', '#643312', '#402310'],
  accent2: ['#f0fae1', '#e1eecc', '#ccdbb2', '#aebf92', '#8fa073', '#728157', '#56633f', '#3d472b', '#272e1b'],
};
