import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  background:
    'linear-gradient(160deg, #06111f 0%, #0f1f35 45%, #101729 100%)',
  color: '#e2e8f0',
  padding: '2rem',
});

export const container = style({
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
});

export const heading = style({
  margin: 0,
  fontSize: '2rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const subheading = style({
  margin: 0,
  color: '#93c5fd',
  fontSize: '1rem',
});

export const intervalSwitcher = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '999px',
  padding: '0.35rem',
  width: 'fit-content',
});

export const intervalButton = style({
  borderRadius: '999px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  padding: '0.4rem 0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
});

export const intervalButtonActive = style({
  backgroundColor: '#2563eb',
  color: '#ffffff',
});

export const cards = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
});

export const card = style({
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '16px',
  padding: '1.2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
});

export const cardTitle = style({
  margin: 0,
  fontSize: '1.1rem',
  color: '#f8fafc',
});

export const cardDescription = style({
  margin: 0,
  color: '#93c5fd',
  lineHeight: 1.45,
});

export const priceId = style({
  margin: 0,
  color: '#cbd5e1',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '0.8rem',
});

export const actionButton = style({
  marginTop: 'auto',
  border: '1px solid #3b82f6',
  backgroundColor: '#1d4ed8',
  color: '#fff',
  fontWeight: 600,
  borderRadius: '10px',
  padding: '0.65rem 0.9rem',
  cursor: 'pointer',
});

export const secondaryLink = style({
  color: '#93c5fd',
  textDecoration: 'none',
  fontWeight: 600,
});

export const errorText = style({
  color: '#fca5a5',
  margin: 0,
});

