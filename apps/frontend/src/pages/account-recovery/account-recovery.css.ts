import { style } from '@vanilla-extract/css';

export const recoveryPage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  '@media': {
    '(min-width: 480px)': { minWidth: '440px' },
    '(min-width: 640px)': { minWidth: '550px' },
  },
});

export const recoveryContainer = style({
  backgroundColor: '#16213e',
  borderRadius: '16px',
  border: '1px solid #1e293b',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  width: '100%',
  maxWidth: '600px',
  padding: '1.5rem',

  '@media': {
    '(max-width: 768px)': {
      padding: '2rem 1.5rem',
      maxWidth: '500px',
    },
    '(max-width: 480px)': {
      padding: '1.5rem 1rem',
      borderRadius: '12px',
    },
  },
});

export const recoveryHeader = style({
  textAlign: 'center',
  marginBottom: '2rem',
});

export const title = style({
  fontSize: '2rem',
  fontWeight: 700,
  color: '#e2e8f0',
  marginBottom: '0.5rem',

  '@media': {
    '(max-width: 480px)': { fontSize: '1.75rem' },
  },
});

export const recoveryForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const label = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const labelText = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const required = style({
  color: '#f87171',
  fontWeight: 'bold',
});

export const input = style({
  width: '100%',
  padding: '0.875rem 1rem',
  fontSize: '1rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: 'inherit',

  selectors: {
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
    },
    '&::placeholder': { color: '#475569' },
  },
});

export const textarea = style({
  width: '100%',
  padding: '0.875rem 1rem',
  fontSize: '1rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  transition: 'all 0.2s ease',
  outline: 'none',
  fontFamily: 'monospace',
  resize: 'vertical',
  minHeight: '120px',
  lineHeight: '1.6',

  selectors: {
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
    },
    '&::placeholder': { color: '#475569', fontFamily: 'inherit' },
  },
});

export const seedPhraseGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '0.75rem',
  marginTop: '0.5rem',

  '@media': {
    '(max-width: 480px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
  },
});

export const seedWord = style({
  padding: '0.75rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  fontFamily: 'monospace',
});

export const seedWordNumber = style({
  color: '#475569',
  marginRight: '0.5rem',
  fontSize: '0.75rem',
});

export const helpText = style({
  fontSize: '0.875rem',
  color: '#64748b',
  marginTop: '0.25rem',
  maxWidth: '350px',
  lineHeight: '1.5',
});

export const errorBox = style({
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  marginBottom: '1rem',
});

export const errorList = style({
  margin: 0,
  paddingLeft: '1.25rem',
  color: '#f87171',
  fontSize: '0.875rem',
});

export const errorText = style({
  margin: '0.25rem 0',
  lineHeight: '1.5',
  color: '#f87171',
});

export const btnSecondary = style({
  width: '100%',
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '1rem 2rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '0.75rem',

  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const divider = style({
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  margin: '1.5rem 0',
  color: '#475569',
  fontSize: '0.875rem',

  selectors: {
    '&::before': {
      content: '""',
      flex: 1,
      borderBottom: '1px solid #1e293b',
      marginRight: '1rem',
    },
    '&::after': {
      content: '""',
      flex: 1,
      borderBottom: '1px solid #1e293b',
      marginLeft: '1rem',
    },
  },
});

export const linkButton = style({
  background: 'none',
  border: 'none',
  color: '#667eea',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '0.5rem',
  transition: 'color 0.2s ease',

  selectors: {
    '&:hover': { color: '#a5b4fc' },
  },
});

export const progressOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
});

export const progressContainer = style({
  backgroundColor: '#16213e',
  borderRadius: '16px',
  border: '1px solid #1e293b',
  padding: '2rem',
  maxWidth: '400px',
  width: '100%',
  textAlign: 'center',
});

export const progressBar = style({
  width: '100%',
  height: '8px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
  overflow: 'hidden',
  marginTop: '1rem',
});

export const progressBarFill = style({
  height: '100%',
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  transition: 'width 0.3s ease',
  borderRadius: '4px',
});

// ============================================
// TOTP Re-Enrollment Screen
// ============================================

export const totpContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const totpHeader = style({
  textAlign: 'center',
});

export const totpTitle = style({
  color: '#e2e8f0',
  marginBottom: '0.5rem',
});

export const totpSubtitle = style({
  color: '#94a3b8',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  margin: 0,
});

export const totpSteps = style({
  background: 'rgba(102, 126, 234, 0.06)',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  borderRadius: '8px',
  padding: '1rem 1rem 1rem 1.25rem',
  textAlign: 'left',
  margin: 0,
  paddingLeft: '2.25rem',
});

export const totpStep = style({
  color: '#94a3b8',
  fontSize: '0.85rem',
  lineHeight: 1.6,
  marginBottom: '0.25rem',
  selectors: {
    '&:last-child': { marginBottom: 0 },
  },
});

export const qrWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  background: '#0f172a',
  borderRadius: '12px',
  border: '2px solid #334155',
  padding: '1.5rem',
});

export const qrImage = style({
  width: '200px',
  height: '200px',
  borderRadius: '8px',
  display: 'block',
});

export const qrCaption = style({
  color: '#64748b',
  fontSize: '0.8rem',
  textAlign: 'center',
  margin: 0,
});

export const secretContainer = style({
  background: '#0f172a',
  borderRadius: '8px',
  border: '1px solid #334155',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const secretLabel = style({
  color: '#64748b',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: 0,
});

export const secretCodeRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const secretCode = style({
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '0.85rem',
  color: '#a5b4fc',
  letterSpacing: '0.1em',
  wordBreak: 'break-all',
  flex: 1,
  margin: 0,
});

export const secretCopyButton = style({
  background: 'transparent',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#667eea',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 600,
  padding: '0.35rem 0.75rem',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  selectors: {
    '&:hover': {
      background: 'rgba(102, 126, 234, 0.1)',
      borderColor: '#667eea',
    },
  },
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
    '&:hover': { color: '#94a3b8' },
  },
});
