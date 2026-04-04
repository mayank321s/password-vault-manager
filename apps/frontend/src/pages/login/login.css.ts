import { style } from '@vanilla-extract/css';

export const loginPage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
});

export const loginContainer = style({
  background: '#16213e',
  borderRadius: '12px',
  border: '1px solid #1e293b',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  padding: '2rem',
  maxWidth: '450px',
  width: '100%',
  '@media': {
    '(max-width: 480px)': {
      padding: '2rem 1.5rem',
    },
  },
});

// ============================================
// Header
// ============================================

export const loginHeader = style({
  textAlign: 'center',
  marginBottom: '2rem',
});

export const loginSubtitle = style({
  color: '#94a3b8',
  fontSize: '1rem',
});

// ============================================
// Form
// ============================================

export const loginForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const passwordInputGroup = style({
  display: 'flex',
  gap: '0.5rem',
});

export const passwordInput = style({
  flex: 1,
});

// ============================================
// Buttons
// ============================================

export const btnIcon = style({
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  fontSize: '1.2rem',
  color: '#94a3b8',
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      background: '#334155',
      color: '#e2e8f0',
    },
  },
});

export const btnLink = style({
  background: 'none',
  border: 'none',
  color: '#667eea',
  cursor: 'pointer',
  fontSize: '0.9rem',
  textDecoration: 'none',
  padding: 0,
  fontWeight: 600,
  selectors: {
    '&:hover': {
      color: '#a5b4fc',
      textDecoration: 'underline',
    },
  },
});

// ============================================
// Info and Error Boxes
// ============================================

export const infoBox = style({
  background: 'rgba(102, 126, 234, 0.08)',
  border: '1px solid rgba(102, 126, 234, 0.25)',
  borderRadius: '8px',
  padding: '1rem',
});

export const infoText = style({
  margin: 0,
  color: '#94a3b8',
  fontSize: '0.85rem',
  lineHeight: 1.5,
});

export const errorBox = style({
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '1rem',
});

export const errorText = style({
  margin: 0,
  color: '#f87171',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  selectors: {
    '& + &': {
      marginTop: '0.5rem',
    },
  },
});

export const ssoCallout = style({
  borderRadius: '12px',
  border: '1px solid rgba(125, 211, 252, 0.24)',
  background: 'rgba(8, 47, 73, 0.35)',
  padding: '0.95rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
});

export const ssoCalloutTitle = style({
  margin: 0,
  color: '#e0f2fe',
  fontSize: '0.95rem',
  fontWeight: 700,
});

export const ssoCalloutText = style({
  margin: 0,
  color: '#bae6fd',
  fontSize: '0.85rem',
  lineHeight: 1.5,
});

export const lookupHint = style({
  color: '#93c5fd',
  fontSize: '0.85rem',
  textAlign: 'center',
});

// ============================================
// Form Footer
// ============================================

export const formFooter = style({
  textAlign: 'center',
  color: '#64748b',
  fontSize: '0.9rem',
  marginTop: '1rem',
});

export const formFooterLink = style({
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: 600,
  selectors: {
    '&:hover': {
      color: '#a5b4fc',
      textDecoration: 'underline',
    },
  },
});

export const divider = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  margin: '1.5rem 0',
});

export const dividerLine = style({
  flex: 1,
  height: '1px',
  background: '#1e293b',
});

export const dividerText = style({
  color: '#475569',
  fontSize: '0.85rem',
});

// ============================================
// Progress Overlay
// ============================================

export const progressOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

export const progressContainer = style({
  background: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '2rem',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center',
});

export const progressTitle = style({
  color: '#e2e8f0',
  marginBottom: '1rem',
  fontSize: '1.25rem',
});

export const progressStage = style({
  color: '#667eea',
  fontWeight: 600,
  fontSize: '1rem',
  marginBottom: '1.5rem',
});

export const progressBar = style({
  width: '100%',
  height: '10px',
  background: '#1e293b',
  borderRadius: '5px',
  overflow: 'hidden',
  marginBottom: '0.5rem',
});

export const progressFill = style({
  height: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  transition: 'width 0.3s ease',
});

export const progressPercent = style({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#667eea',
  margin: '0.5rem 0',
});

// ============================================
// TOTP Step
// ============================================

export const totpContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const totpHeader = style({
  textAlign: 'center',
});

export const totpIconWrapper = style({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '1rem',
});

export const totpIcon = style({
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: 'rgba(102, 126, 234, 0.12)',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  color: '#a5b4fc',
});

export const totpTitle = style({
  color: '#e2e8f0',
  fontSize: '1.5rem',
  marginBottom: '0.5rem',
});

export const totpSubtitle = style({
  color: '#94a3b8',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  margin: 0,
});

export const totpForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const totpInputLabel = style({
  color: '#94a3b8',
  fontSize: '0.9rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
  display: 'block',
});

export const totpInput = style({
  width: '100%',
  padding: '1rem',
  background: '#1e293b',
  border: '2px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '1.75rem',
  fontWeight: 700,
  letterSpacing: '0.5em',
  textAlign: 'center',
  fontFamily: "'Courier New', Courier, monospace",
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
    },
    '&::placeholder': {
      color: '#334155',
      letterSpacing: '0.25em',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const totpInputHint = style({
  color: '#475569',
  fontSize: '0.8rem',
  textAlign: 'center',
  margin: 0,
});

export const totpActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const btnGhost = style({
  background: 'transparent',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: '0.85rem',
  padding: '0.5rem',
  textAlign: 'center',
  textDecoration: 'underline',
  transition: 'color 0.2s ease',
  selectors: {
    '&:hover': {
      color: '#94a3b8',
    },
  },
});
