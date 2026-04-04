import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  backgroundColor: '#081225',
  color: '#e2e8f0',
  padding: '2rem',
});

export const container = style({
  maxWidth: '1040px',
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

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
});

export const formInline = style({
  display: 'grid',
  gridTemplateColumns: '1fr 180px auto',
  gap: '0.5rem',
  '@media': {
    '(max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const label = style({
  fontSize: '0.88rem',
  color: '#cbd5e1',
});

export const input = style({
  border: '1px solid #334155',
  borderRadius: '10px',
  backgroundColor: '#020617',
  color: '#e2e8f0',
  padding: '0.6rem 0.7rem',
  fontSize: '0.95rem',
});

export const select = style({
  border: '1px solid #334155',
  borderRadius: '10px',
  backgroundColor: '#020617',
  color: '#e2e8f0',
  padding: '0.6rem 0.7rem',
  fontSize: '0.95rem',
});

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

export const hint = style({
  margin: 0,
  color: '#cbd5e1',
  fontSize: '0.9rem',
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
});

export const th = style({
  textAlign: 'left',
  color: '#93c5fd',
  borderBottom: '1px solid #1e293b',
  padding: '0.55rem 0.4rem',
  fontSize: '0.85rem',
});

export const td = style({
  borderBottom: '1px solid #1e293b',
  padding: '0.55rem 0.4rem',
  color: '#cbd5e1',
  fontSize: '0.9rem',
});

export const successText = style({
  margin: 0,
  color: '#86efac',
  fontSize: '0.92rem',
});

export const errorText = style({
  margin: 0,
  color: '#fecaca',
});

export const link = style({
  color: '#93c5fd',
  textDecoration: 'none',
  fontWeight: 600,
});
