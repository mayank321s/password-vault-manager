import { style, keyframes } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const slideUp = keyframes({
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const pageContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  animation: `${fadeIn} 0.3s ease`,

  '@media': {
    '(max-width: 640px)': { padding: '1rem' },
  },
});

export const contentCard = style({
  backgroundColor: '#16213e',
  borderRadius: '16px',
  border: '1px solid #1e293b',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  width: '100%',
  maxWidth: '600px',
  animation: `${slideUp} 0.4s ease`,
  overflow: 'hidden',
});

export const header = style({
  padding: '2rem',
  borderBottom: '1px solid #1e293b',
  textAlign: 'center',

  '@media': {
    '(max-width: 640px)': { padding: '1.5rem' },
  },
});

export const title = style({
  fontSize: '2rem',
  fontWeight: 700,
  color: '#e2e8f0',
  margin: 0,
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',

  '@media': {
    '(max-width: 640px)': { fontSize: '1.5rem' },
  },
});

export const subtitle = style({
  fontSize: '1rem',
  color: '#94a3b8',
  margin: 0,

  '@media': {
    '(max-width: 640px)': { fontSize: '0.875rem' },
  },
});

export const body = style({
  padding: '2rem',

  '@media': {
    '(max-width: 640px)': { padding: '1.5rem' },
  },
});

export const loadingState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 2rem',
  gap: '1rem',
});

export const loadingSpinner = style({
  border: '4px solid #1e293b',
  borderTop: `4px solid #667eea`,
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  animation: `${spin} 1s linear infinite`,
});

export const loadingText = style({
  fontSize: '1rem',
  color: '#94a3b8',
  fontWeight: 500,
});

export const errorState = style({
  textAlign: 'center',
  padding: '2rem',
});

export const errorIcon = style({
  fontSize: '4rem',
  marginBottom: '1rem',
});

export const errorTitle = style({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#f87171',
  marginBottom: '0.5rem',

  '@media': {
    '(max-width: 640px)': { fontSize: '1.25rem' },
  },
});

export const errorMessage = style({
  fontSize: '1rem',
  color: '#64748b',
  lineHeight: 1.6,
  marginBottom: '1.5rem',
});

export const warningBox = style({
  backgroundColor: 'rgba(251, 191, 36, 0.06)',
  border: '1px solid rgba(251, 191, 36, 0.35)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1.5rem',
});

export const warningTitle = style({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#fbbf24',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const warningText = style({
  fontSize: '0.875rem',
  color: '#d97706',
  textAlign: 'left',
  lineHeight: 1.6,
  margin: 0,
});

export const btnSecondary = style({
  backgroundColor: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.75rem 2rem',
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

export const noteText = style({
  fontFamily: 'monospace',
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  backgroundColor: '#0f172a',
  borderRadius: '8px',
  border: '1px solid #1e293b',
  padding: '0.5rem 0',
  maxHeight: '400px',
  overflowX: 'auto',
  overflowY: 'auto',

  selectors: {
    '&::-webkit-scrollbar': { width: '4px', height: '4px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      background: '#334155',
      borderRadius: '2px',
    },
  },
});

export const noteLines = style({
  minWidth: 'max-content',
});

export const noteLine = style({
  display: 'flex',
  alignItems: 'flex-start',
});

export const noteLineNumber = style({
  width: '2.75rem',
  minWidth: '2.75rem',
  textAlign: 'right',
  paddingRight: '1rem',
  color: '#334155',
  userSelect: 'none',
  flexShrink: 0,
  position: 'sticky',
  left: 0,
  backgroundColor: '#0f172a',
});

export const noteLineContent = style({
  color: '#cbd5e1',
  whiteSpace: 'pre',
  flexShrink: 0,
  paddingRight: '1rem',
});

export const detailFieldRow = style({
  marginBottom: '0.75rem',
  textAlign: 'left',
});

export const detailSectionLabel = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.4rem',
});

export const fieldValueRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  padding: '0.5rem 0.75rem',
  border: '1px solid #1e293b',
});

export const fieldValueText = style({
  fontSize: '0.875rem',
  color: '#e2e8f0',
  fontFamily: 'monospace',
  letterSpacing: '0.02em',
  wordBreak: 'break-all',
  flex: 1,
  minWidth: 0,
});

export const iconButton = style({
  background: 'none',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: '#94a3b8',
  transition: 'all 0.15s ease',
  flexShrink: 0,

  selectors: {
    '&:hover': {
      backgroundColor: '#0f3460',
      borderColor: '#334155',
      color: '#e2e8f0',
    },
  },
});

export const iconButtonCopied = style({
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  borderColor: '#10b981',
  color: '#34d399',

  selectors: {
    '&:disabled': { cursor: 'default', opacity: 1 },
  },
});
