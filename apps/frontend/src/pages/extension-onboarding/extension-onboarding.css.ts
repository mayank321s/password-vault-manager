import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 30%), linear-gradient(180deg, #08111f 0%, #0f172a 100%)',
  color: '#e2e8f0',
  padding: '2rem 1.25rem 3rem',
});

export const shell = style({
  maxWidth: '1120px',
  margin: '0 auto',
  display: 'grid',
  gap: '1.25rem',
});

export const hero = style({
  display: 'grid',
  gap: '0.75rem',
});

export const eyebrow = style({
  margin: 0,
  color: '#93c5fd',
  fontSize: '0.9rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

export const title = style({
  margin: 0,
  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
  lineHeight: 1.05,
  color: '#f8fafc',
  fontWeight: 800,
  maxWidth: '14ch',
});

export const lead = style({
  margin: 0,
  maxWidth: '68ch',
  color: '#cbd5e1',
  fontSize: '1rem',
  lineHeight: 1.7,
});

export const heroActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
});

export const primaryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  border: '1px solid #38bdf8',
  background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
  color: '#ffffff',
  padding: '0.8rem 1.2rem',
  fontWeight: 700,
  textDecoration: 'none',
});

export const secondaryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  border: '1px solid #334155',
  backgroundColor: 'rgba(15, 23, 42, 0.75)',
  color: '#e2e8f0',
  padding: '0.8rem 1.2rem',
  fontWeight: 600,
  textDecoration: 'none',
});

export const browserGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
});

export const browserCard = style({
  borderRadius: '20px',
  border: '1px solid #1e293b',
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  padding: '1rem',
  display: 'grid',
  gap: '0.6rem',
});

export const browserCardActive = style({
  borderColor: '#38bdf8',
  boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.35)',
});

export const browserButton = style({
  all: 'unset',
  cursor: 'pointer',
  display: 'grid',
  gap: '0.6rem',
});

export const browserTitle = style({
  margin: 0,
  color: '#f8fafc',
  fontWeight: 700,
  fontSize: '1rem',
});

export const browserMeta = style({
  margin: 0,
  color: '#93c5fd',
  fontSize: '0.88rem',
});

export const browserText = style({
  margin: 0,
  color: '#cbd5e1',
  fontSize: '0.92rem',
  lineHeight: 1.6,
});

export const contentGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.9fr)',
  gap: '1rem',
  '@media': {
    '(max-width: 860px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const panel = style({
  borderRadius: '22px',
  border: '1px solid #1e293b',
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  padding: '1.1rem',
  display: 'grid',
  gap: '0.9rem',
});

export const panelTitle = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '1.05rem',
  fontWeight: 700,
});

export const steps = style({
  display: 'grid',
  gap: '0.8rem',
});

export const step = style({
  display: 'grid',
  gridTemplateColumns: '42px 1fr',
  gap: '0.75rem',
  alignItems: 'start',
});

export const stepNumber = style({
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  backgroundColor: '#0f766e',
  color: '#ecfeff',
  fontWeight: 800,
  display: 'grid',
  placeItems: 'center',
});

export const stepTitle = style({
  margin: '0 0 0.25rem',
  color: '#f8fafc',
  fontWeight: 700,
});

export const stepText = style({
  margin: 0,
  color: '#cbd5e1',
  lineHeight: 1.6,
  fontSize: '0.95rem',
});

export const checklist = style({
  display: 'grid',
  gap: '0.65rem',
});

export const checklistItem = style({
  display: 'grid',
  gridTemplateColumns: '18px 1fr',
  gap: '0.55rem',
  alignItems: 'start',
  color: '#cbd5e1',
  fontSize: '0.95rem',
  lineHeight: 1.6,
});

export const check = style({
  color: '#22c55e',
  fontWeight: 800,
});

export const completionBox = style({
  borderRadius: '18px',
  border: '1px solid #1d4ed8',
  backgroundColor: 'rgba(30, 64, 175, 0.2)',
  padding: '1rem',
  display: 'grid',
  gap: '0.75rem',
});

export const completionText = style({
  margin: 0,
  color: '#dbeafe',
  lineHeight: 1.6,
});

export const helperLink = style({
  color: '#7dd3fc',
  fontWeight: 700,
  textDecoration: 'none',
});
