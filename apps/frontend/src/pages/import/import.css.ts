import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 30%), radial-gradient(circle at top right, rgba(129, 140, 248, 0.18), transparent 28%), #081120',
  color: '#e2e8f0',
  padding: '2rem',
  boxSizing: 'border-box',
});

export const shell = style({
  maxWidth: '1180px',
  margin: '0 auto',
  display: 'grid',
  gap: '1.25rem',
});

export const hero = style({
  display: 'grid',
  gap: '0.65rem',
  padding: '1.5rem',
  borderRadius: '24px',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  background:
    'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 118, 110, 0.18))',
});

export const eyebrow = style({
  margin: 0,
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: '#7dd3fc',
  fontWeight: 700,
});

export const title = style({
  margin: 0,
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  lineHeight: 1.05,
  fontWeight: 800,
  color: '#f8fafc',
});

export const subtitle = style({
  margin: 0,
  maxWidth: '760px',
  color: '#cbd5e1',
  fontSize: '0.98rem',
  lineHeight: 1.7,
});

export const layout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.9fr)',
  gap: '1.25rem',
  '@media': {
    '(max-width: 960px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const panel = style({
  display: 'grid',
  gap: '1rem',
  borderRadius: '22px',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  padding: '1.25rem',
  boxShadow: '0 18px 50px rgba(2, 6, 23, 0.35)',
});

export const panelTitle = style({
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const grid = style({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  '@media': {
    '(max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const field = style({
  display: 'grid',
  gap: '0.45rem',
});

export const label = style({
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#94a3b8',
});

export const input = style({
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '14px',
  border: '1px solid #334155',
  backgroundColor: '#0f172a',
  color: '#e2e8f0',
  padding: '0.85rem 1rem',
  fontSize: '0.95rem',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#38bdf8',
      boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.18)',
    },
  },
});

export const textarea = style([
  input,
  {
    minHeight: '200px',
    resize: 'vertical',
    fontFamily: 'Consolas, monospace',
    fontSize: '0.85rem',
    lineHeight: 1.55,
  },
]);

export const uploadBox = style({
  borderRadius: '18px',
  border: '1px dashed rgba(125, 211, 252, 0.45)',
  backgroundColor: 'rgba(8, 17, 32, 0.72)',
  padding: '1rem',
  display: 'grid',
  gap: '0.7rem',
});

export const uploadRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  alignItems: 'center',
});

export const uploadHint = style({
  margin: 0,
  color: '#94a3b8',
  fontSize: '0.82rem',
  lineHeight: 1.6,
});

export const hiddenInput = style({
  display: 'none',
});

export const fileName = style({
  color: '#cbd5e1',
  fontSize: '0.84rem',
});

export const actionRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  alignItems: 'center',
});

export const primaryButton = style({
  border: 'none',
  borderRadius: '14px',
  padding: '0.85rem 1.1rem',
  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
  color: '#020617',
  fontWeight: 800,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
});

export const secondaryButton = style({
  borderRadius: '14px',
  padding: '0.85rem 1.1rem',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  backgroundColor: 'transparent',
  color: '#e2e8f0',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
});

export const smallMeta = style({
  margin: 0,
  color: '#94a3b8',
  fontSize: '0.82rem',
});

export const statGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.75rem',
});

export const statCard = style({
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  backgroundColor: 'rgba(8, 17, 32, 0.8)',
  padding: '0.95rem',
  display: 'grid',
  gap: '0.3rem',
});

export const statValue = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '1.5rem',
  fontWeight: 800,
});

export const statLabel = style({
  margin: 0,
  color: '#94a3b8',
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 700,
});

export const issueList = style({
  display: 'grid',
  gap: '0.75rem',
});

export const issueCard = style({
  borderRadius: '16px',
  padding: '0.9rem',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  display: 'grid',
  gap: '0.35rem',
});

export const issueHeader = style({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  flexWrap: 'wrap',
});

export const issueSeverity = style({
  borderRadius: '999px',
  padding: '0.2rem 0.55rem',
  fontSize: '0.72rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
});

export const severityWarning = style({
  backgroundColor: 'rgba(250, 204, 21, 0.14)',
  color: '#fde68a',
});

export const severityError = style({
  backgroundColor: 'rgba(248, 113, 113, 0.14)',
  color: '#fca5a5',
});

export const issueTitle = style({
  margin: 0,
  fontSize: '0.88rem',
  fontWeight: 700,
  color: '#f8fafc',
});

export const issueText = style({
  margin: 0,
  color: '#cbd5e1',
  fontSize: '0.84rem',
  lineHeight: 1.55,
});

export const previewTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.86rem',
});

export const th = style({
  textAlign: 'left',
  padding: '0.7rem',
  color: '#94a3b8',
  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const td = style({
  padding: '0.75rem 0.7rem',
  borderBottom: '1px solid rgba(30, 41, 59, 0.85)',
  color: '#e2e8f0',
  verticalAlign: 'top',
});

export const reviewBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '0.2rem 0.55rem',
  fontSize: '0.72rem',
  fontWeight: 800,
});

export const reviewNeeded = style({
  backgroundColor: 'rgba(250, 204, 21, 0.15)',
  color: '#fde68a',
});

export const reviewClean = style({
  backgroundColor: 'rgba(74, 222, 128, 0.15)',
  color: '#86efac',
});

export const checklist = style({
  display: 'grid',
  gap: '0.65rem',
});

export const checklistRow = style({
  display: 'flex',
  gap: '0.6rem',
  alignItems: 'flex-start',
});

export const checklistBullet = style({
  width: '0.55rem',
  height: '0.55rem',
  borderRadius: '50%',
  marginTop: '0.4rem',
  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
  flexShrink: 0,
});

export const summaryCard = style({
  borderRadius: '20px',
  border: '1px solid rgba(74, 222, 128, 0.18)',
  background:
    'linear-gradient(135deg, rgba(6, 95, 70, 0.22), rgba(15, 23, 42, 0.92))',
  padding: '1rem',
  display: 'grid',
  gap: '0.5rem',
});

export const summaryTitle = style({
  margin: 0,
  color: '#ecfeff',
  fontWeight: 800,
  fontSize: '1rem',
});
