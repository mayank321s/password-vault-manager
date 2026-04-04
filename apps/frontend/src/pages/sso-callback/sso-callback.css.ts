import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  background: 'linear-gradient(180deg, #08111f 0%, #111827 100%)',
});

export const card = style({
  width: '100%',
  maxWidth: '640px',
  borderRadius: '18px',
  padding: '2rem',
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  boxShadow: '0 24px 70px rgba(15, 23, 42, 0.45)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const title = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '1.6rem',
  fontWeight: 700,
});

export const kicker = style({
  margin: 0,
  color: '#7dd3fc',
  fontSize: '0.8rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const text = style({
  margin: 0,
  color: '#cbd5e1',
  lineHeight: 1.6,
});

export const errorText = style({
  margin: 0,
  color: '#fda4af',
  lineHeight: 1.6,
});

export const statusPanel = style({
  borderRadius: '14px',
  border: '1px solid rgba(125, 211, 252, 0.2)',
  backgroundColor: 'rgba(8, 47, 73, 0.35)',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const noticeCard = style({
  borderRadius: '14px',
  border: '1px solid rgba(251, 191, 36, 0.25)',
  backgroundColor: 'rgba(120, 53, 15, 0.25)',
  padding: '1rem',
});

export const noticeTitle = style({
  margin: '0 0 0.5rem',
  color: '#fde68a',
  fontSize: '0.95rem',
  fontWeight: 700,
});

export const actions = style({
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
});

export const linkButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 700,
  color: '#08111f',
  backgroundColor: '#7dd3fc',
});

export const secondaryLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 700,
  color: '#e2e8f0',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
});
