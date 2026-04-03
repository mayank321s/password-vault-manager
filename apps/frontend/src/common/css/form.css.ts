import { style } from '@vanilla-extract/css';

export const formStyles = {
  formLabel: style({
    fontWeight: 600,
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'left',
  }),

  formInput: style({
    padding: '0.75rem 1rem',
    width: '100%',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '1rem',
    background: '#1e293b',
    color: '#e2e8f0',
    transition: 'all 0.3s ease',
    selectors: {
      '&:focus': {
        outline: 'none',
        borderColor: '#667eea',
        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
      },
      '&::placeholder': {
        color: '#475569',
      },
    },
  }),
};
