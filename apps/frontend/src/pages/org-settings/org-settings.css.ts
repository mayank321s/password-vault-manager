import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  backgroundColor: '#0b1020',
  color: '#e2e8f0',
  padding: '2rem',
});

export const container = style({
  maxWidth: '980px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
});

export const heading = style({
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const subheading = style({
  margin: 0,
  color: '#94a3b8',
  fontSize: '0.9375rem',
});

export const tabRow = style({
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
});

export const tabButton = style({
  border: '1px solid #334155',
  borderRadius: '999px',
  backgroundColor: '#111827',
  color: '#cbd5e1',
  padding: '0.45rem 0.9rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: '#64748b',
      color: '#f8fafc',
    },
  },
});

export const tabButtonActive = style({
  borderColor: '#667eea',
  backgroundColor: '#1f2a44',
  color: '#ffffff',
});

export const sectionPanel = style({
  border: '1px solid #1e293b',
  borderRadius: '14px',
  backgroundColor: '#111827',
  padding: '1.25rem',
});

export const sectionTitle = style({
  margin: '0 0 0.5rem',
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const sectionDescription = style({
  margin: 0,
  color: '#94a3b8',
  lineHeight: 1.5,
  fontSize: '0.925rem',
});

export const billingLink = style({
  color: '#93c5fd',
  textDecoration: 'none',
  fontWeight: 600,
  selectors: {
    '&:hover': {
      color: '#bfdbfe',
      textDecoration: 'underline',
    },
  },
});
