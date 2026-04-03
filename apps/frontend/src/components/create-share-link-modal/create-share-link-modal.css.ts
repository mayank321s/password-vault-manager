import { style, keyframes } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const slideIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const modalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
  animation: `${fadeIn} 0.2s ease`,
});

export const modalCard = style({
  backgroundColor: '#16213e',
  borderRadius: '16px',
  border: '1px solid #1e293b',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflow: 'auto',
  animation: `${slideIn} 0.3s ease`,
  position: 'relative',
});

export const modalHeader = style({
  padding: '1rem',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  backgroundColor: '#16213e',
  zIndex: 10,
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',

  '@media': {
    '(max-width: 640px)': { padding: '1rem 1.5rem' },
  },
});

export const modalTitle = style({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#e2e8f0',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',

  '@media': {
    '(max-width: 640px)': { fontSize: '1.25rem' },
  },
});

export const btnClose = style({
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  color: '#64748b',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  selectors: {
    '&:hover': { backgroundColor: '#1e293b', color: '#e2e8f0' },
  },
});

export const modalBody = style({
  padding: '1rem',

  '@media': {
    '(max-width: 640px)': { padding: '1.5rem' },
  },
});

export const linkBox = style({
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1.5rem',
});

export const linkLabel = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '0.5rem',
});

export const linkUrl = style({
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '0.75rem',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  wordBreak: 'break-all',
  marginBottom: '0.75rem',
});

export const linkActions = style({
  display: 'flex',
  gap: '0.75rem',

  '@media': {
    '(max-width: 640px)': { flexDirection: 'column' },
  },
});

export const btnCopy = style({
  flex: 1,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',

  selectors: {
    '&:hover:not(:disabled)': { opacity: 0.9, transform: 'translateY(-1px)' },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const btnCopySuccess = style({
  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  boxShadow: '0 4px 12px rgba(74, 222, 128, 0.25)',

  selectors: {
    '&:hover:not(:disabled)': { opacity: 0.9 },
  },
});

export const infoBox = style({
  backgroundColor: 'rgba(102, 126, 234, 0.08)',
  border: '1px solid rgba(102, 126, 234, 0.25)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1.5rem',
});

export const infoText = style({
  fontSize: '0.875rem',
  color: '#93c5fd',
  lineHeight: 1.6,
  margin: 0,
});

export const errorBox = style({
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  borderRadius: '8px',
  padding: '0.875rem 1rem',
  marginBottom: '1rem',
});

export const errorText = style({
  fontSize: '0.875rem',
  color: '#fca5a5',
  lineHeight: 1.5,
  margin: 0,
});

export const progressOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  borderRadius: '16px',
});

export const progressContent = style({
  textAlign: 'center',
  maxWidth: '400px',
  padding: '2rem',
});

export const progressSpinner = style({
  border: '4px solid #1e293b',
  borderTop: '4px solid #667eea',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 1rem',
});

export const progressText = style({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#e2e8f0',
  marginBottom: '0.5rem',
});

export const progressStage = style({
  fontSize: '0.875rem',
  color: '#94a3b8',
  marginBottom: '1rem',
});

export const progressBar = style({
  width: '100%',
  height: '8px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
  overflow: 'hidden',
});

export const progressBarFill = style({
  height: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  transition: 'width 0.3s ease',
});

export const modalFooter = style({
  padding: '1rem',
  borderTop: '1px solid #1e293b',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  position: 'sticky',
  bottom: 0,
  backgroundColor: '#16213e',
  zIndex: 10,
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',

  '@media': {
    '(max-width: 640px)': {
      padding: '1rem 1.5rem',
      flexDirection: 'column-reverse',
    },
  },
});

export const btnSecondary = style({
  backgroundColor: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },

  '@media': {
    '(max-width: 640px)': { width: '100%' },
  },
});
