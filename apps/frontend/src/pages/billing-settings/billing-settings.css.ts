import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  backgroundColor: '#081225',
  color: '#e2e8f0',
  padding: '2rem',
});

export const container = style({
  maxWidth: '1100px',
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

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
});

export const card = style({
  border: '1px solid #1e293b',
  borderRadius: '14px',
  backgroundColor: '#0f172a',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const cardTitle = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '1rem',
  fontWeight: 700,
});

export const cardText = style({
  margin: 0,
  color: '#cbd5e1',
});

export const prompt = style({
  border: '1px solid #4338ca',
  backgroundColor: '#1e1b4b',
  borderRadius: '12px',
  padding: '0.9rem',
  color: '#c7d2fe',
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

export const link = style({
  color: '#93c5fd',
  textDecoration: 'none',
  fontWeight: 600,
});

export const invoiceTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '0.5rem',
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

export const errorText = style({
  margin: 0,
  color: '#fecaca',
});

export const warningText = style({
  margin: 0,
  color: '#fcd34d',
  lineHeight: 1.5,
});

