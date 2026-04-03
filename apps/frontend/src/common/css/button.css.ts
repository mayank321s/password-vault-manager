import { style } from '@vanilla-extract/css';

export const button = {
  primary: style({
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'opacity 0.2s ease, transform 0.15s ease',

    selectors: {
      '&:hover:not(:disabled)': {
        opacity: 0.9,
        transform: 'translateY(-1px)',
      },
      '&:active:not(:disabled)': {
        transform: 'translateY(0)',
      },
      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    },
  }),
  primarySmall: style({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.4rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',

    selectors: {
      '&:disabled': {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
  }),
};
