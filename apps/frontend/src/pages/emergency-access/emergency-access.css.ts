import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  backgroundColor: '#081225',
  color: '#e2e8f0',
  padding: '2rem',
});

export const container = style({
  maxWidth: '1120px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const heading = style({
  margin: 0,
  fontSize: '1.7rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const subheading = style({
  margin: 0,
  color: '#93c5fd',
  lineHeight: 1.5,
});

export const card = style({
  border: '1px solid #1e293b',
  borderRadius: '14px',
  backgroundColor: '#0f172a',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const cardTitle = style({
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const formGrid = style({
  display: 'grid',
  gridTemplateColumns: '1.3fr 180px 1fr auto',
  gap: '0.5rem',
  '@media': {
    '(max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const input = style({
  border: '1px solid #334155',
  borderRadius: '10px',
  backgroundColor: '#020617',
  color: '#e2e8f0',
  padding: '0.6rem 0.7rem',
  fontSize: '0.95rem',
});

export const textarea = style([
  input,
  {
    minHeight: '90px',
    resize: 'vertical',
  },
]);

export const button = style({
  width: 'fit-content',
  border: '1px solid #2563eb',
  backgroundColor: '#1d4ed8',
  color: '#fff',
  borderRadius: '10px',
  padding: '0.55rem 0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
});

export const secondaryButton = style([
  button,
  {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
]);

export const dangerButton = style([
  button,
  {
    backgroundColor: '#991b1b',
    borderColor: '#b91c1c',
  },
]);

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1rem',
});

export const itemCard = style({
  border: '1px solid #1e293b',
  borderRadius: '12px',
  backgroundColor: '#020617',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
});

export const itemTitle = style({
  margin: 0,
  fontSize: '0.98rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const text = style({
  margin: 0,
  color: '#cbd5e1',
  fontSize: '0.92rem',
  lineHeight: 1.45,
});

export const meta = style({
  margin: 0,
  color: '#93c5fd',
  fontSize: '0.84rem',
});

export const errorText = style({
  margin: 0,
  color: '#fecaca',
});

export const emptyText = style({
  margin: 0,
  color: '#94a3b8',
});

export const actions = style({
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  marginTop: '0.4rem',
});
