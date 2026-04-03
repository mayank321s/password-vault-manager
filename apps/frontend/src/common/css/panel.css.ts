import { style, keyframes } from '@vanilla-extract/css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const loadingSpinner = style({
  border: '3px solid #1e293b',
  borderTop: '3px solid #667eea',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  animation: `${spin} 0.8s linear infinite`,
});

export const loadingCenter = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const errorBanner = style({
  margin: '1rem',
  padding: '0.75rem 1rem',
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  color: '#f87171',
});

export const detailColumn = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: '#0f172a',
});

export const vaultRoleBadge = style({
  fontSize: '0.625rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '1px 5px',
  borderRadius: '4px',
  flexShrink: 0,
  alignSelf: 'flex-start',
  marginTop: '2px',
});

export const vaultRoleOwner = style({
  backgroundColor: 'rgba(124, 58, 237, 0.2)',
  color: '#a78bfa',
});

export const vaultRoleManager = style({
  backgroundColor: 'rgba(3, 105, 161, 0.2)',
  color: '#38bdf8',
});

export const vaultRoleMember = style({
  backgroundColor: 'rgba(22, 163, 74, 0.2)',
  color: '#4ade80',
});
