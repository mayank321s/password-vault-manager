import { style } from '@vanilla-extract/css';

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const passwordLabel = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const passwordInputGroup = style({
  display: 'flex',
  gap: '0.5rem',
});

export const btnIcon = style({
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  fontSize: '1.2rem',
  transition: 'all 0.2s ease',
  color: '#94a3b8',

  selectors: {
    '&:hover:not(:disabled)': {
      background: '#334155',
      color: '#e2e8f0',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const generateBtn = style({
  background: 'none',
  border: 'none',
  color: '#667eea',
  cursor: 'pointer',
  fontSize: '0.85rem',
  padding: 0,
  transition: 'color 0.2s ease',

  selectors: {
    '&:hover:not(:disabled)': { color: '#a5b4fc' },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const passwordStrengthContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const strengthBar = style({
  display: 'flex',
  gap: '4px',
  height: '6px',
});

export const strengthSegment = style({
  flex: 1,
  borderRadius: '3px',
  background: '#1e293b',
  transition: 'background-color 0.3s ease',
});

export const strengthText = style({
  fontSize: '0.85rem',
  color: '#64748b',
  margin: 0,
});
