import { style } from '@vanilla-extract/css';

export const formActions = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const emailDisplay = style({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#94a3b8',
  padding: '0.75rem 1rem',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  userSelect: 'none',
});

export const lockIcon = style({
  fontSize: '2.5rem',
  display: 'block',
  textAlign: 'center',
  marginBottom: '0.5rem',
  color: '#94a3b8',
});
