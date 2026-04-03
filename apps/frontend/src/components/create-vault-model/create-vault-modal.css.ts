import { style } from '@vanilla-extract/css';

export const modalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
  animation: 'fadeIn 0.2s ease-out',
});

export const modal = style({
  backgroundColor: '#16213e',
  borderRadius: '16px',
  border: '1px solid #1e293b',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  width: '100%',
  maxWidth: '500px',
  padding: '2rem',
  animation: 'slideIn 0.3s ease-out',
  position: 'relative',
  maxHeight: '90vh',
  overflowY: 'auto',
});

export const modalHeader = style({
  marginBottom: '1.5rem',
});

export const modalTitle = style({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#e2e8f0',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const modalSubtitle = style({
  fontSize: '0.95rem',
  color: '#94a3b8',
  lineHeight: '1.5',
});

export const modalForm = style({
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
  gap: '0.25rem',
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
    '&::placeholder': {
      color: '#475569',
    },
  },
});

export const helpText = style({
  fontSize: '0.875rem',
  color: '#64748b',
  marginTop: '0.25rem',
  lineHeight: '1.5',
});

export const errorBox = style({
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
});

export const errorText = style({
  color: '#f87171',
  fontSize: '0.875rem',
  margin: 0,
  lineHeight: '1.5',
});

export const modalActions = style({
  display: 'flex',
  gap: '0.75rem',
  marginTop: '1.5rem',
});

export const btnSecondary = style({
  flex: 1,
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.875rem 1.5rem',
  fontSize: '1rem',
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
});

export const progressContainer = style({
  padding: '1rem 0',
  textAlign: 'center',
});

export const progressText = style({
  fontSize: '0.875rem',
  color: '#94a3b8',
  marginBottom: '0.5rem',
});

export const progressBar = style({
  width: '100%',
  height: '6px',
  backgroundColor: '#1e293b',
  borderRadius: '3px',
  overflow: 'hidden',
});

export const progressBarFill = style({
  height: '100%',
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  transition: 'width 0.3s ease',
  borderRadius: '3px',
});
