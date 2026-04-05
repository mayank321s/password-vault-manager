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
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
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

export const embeddedSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const identityLayout = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1rem',
});

export const calloutCard = style({
  borderRadius: '16px',
  border: '1px solid #1e293b',
  backgroundColor: '#0f172a',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
});

export const calloutTitle = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '1rem',
  fontWeight: 700,
});

export const identityForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const fieldLabel = style({
  color: '#cbd5e1',
  fontSize: '0.85rem',
  fontWeight: 600,
});

export const fieldInput = style({
  minHeight: '44px',
  borderRadius: '12px',
  border: '1px solid #334155',
  backgroundColor: '#111827',
  color: '#e2e8f0',
  padding: '0.75rem 0.9rem',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#7dd3fc',
      boxShadow: '0 0 0 3px rgba(125, 211, 252, 0.16)',
    },
  },
});

export const toggleRow = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '0.75rem',
  alignItems: 'flex-start',
});

export const toggleInput = style({
  width: '18px',
  height: '18px',
  marginTop: '0.15rem',
  accentColor: '#7dd3fc',
});

export const inlineHint = style({
  display: 'block',
  marginTop: '0.25rem',
  color: '#94a3b8',
  fontSize: '0.825rem',
  lineHeight: 1.5,
});

export const buttonRow = style({
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
});

export const primaryButton = style({
  minHeight: '44px',
  border: 'none',
  borderRadius: '12px',
  backgroundColor: '#7dd3fc',
  color: '#082f49',
  fontWeight: 700,
  cursor: 'pointer',
});

export const secondaryButton = style({
  minHeight: '44px',
  border: '1px solid #334155',
  borderRadius: '12px',
  backgroundColor: '#111827',
  color: '#e2e8f0',
  fontWeight: 700,
  cursor: 'pointer',
  padding: '0.75rem 1rem',
});

export const statusGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '0.75rem',
});

export const statusCard = style({
  borderRadius: '14px',
  border: '1px solid #1e293b',
  backgroundColor: '#111827',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
});

export const statusLabel = style({
  color: '#94a3b8',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
});

export const statusValue = style({
  color: '#f8fafc',
  fontSize: '0.95rem',
  wordBreak: 'break-word',
});

export const domainList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const domainCard = style({
  borderRadius: '14px',
  border: '1px solid #1e293b',
  backgroundColor: '#111827',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
});

export const domainHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.75rem',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
});

export const domainTitle = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '0.95rem',
  fontWeight: 700,
});

export const domainMeta = style({
  margin: 0,
  color: '#94a3b8',
  fontSize: '0.825rem',
  lineHeight: 1.5,
});

export const domainBadgePending = style({
  borderRadius: '999px',
  backgroundColor: 'rgba(251, 191, 36, 0.14)',
  color: '#fcd34d',
  padding: '0.3rem 0.7rem',
  fontSize: '0.75rem',
  fontWeight: 700,
});

export const domainBadgeVerified = style({
  borderRadius: '999px',
  backgroundColor: 'rgba(74, 222, 128, 0.14)',
  color: '#86efac',
  padding: '0.3rem 0.7rem',
  fontSize: '0.75rem',
  fontWeight: 700,
});

export const domainBadgeCritical = style({
  borderRadius: '999px',
  backgroundColor: 'rgba(248, 113, 113, 0.16)',
  color: '#fca5a5',
  padding: '0.3rem 0.7rem',
  fontSize: '0.75rem',
  fontWeight: 700,
});

export const domainBadgeInfo = style({
  borderRadius: '999px',
  backgroundColor: 'rgba(125, 211, 252, 0.16)',
  color: '#7dd3fc',
  padding: '0.3rem 0.7rem',
  fontSize: '0.75rem',
  fontWeight: 700,
});

export const tokenLabel = style({
  margin: 0,
  color: '#cbd5e1',
  fontSize: '0.78rem',
  fontWeight: 700,
});

export const tokenValue = style({
  display: 'block',
  borderRadius: '12px',
  backgroundColor: '#020617',
  color: '#7dd3fc',
  padding: '0.75rem',
  border: '1px solid #1e293b',
  overflowWrap: 'anywhere',
});

export const verifyRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '0.75rem',
  '@media': {
    '(max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const successText = style({
  margin: 0,
  color: '#86efac',
  fontSize: '0.9rem',
  lineHeight: 1.5,
});

export const errorText = style({
  margin: 0,
  color: '#fca5a5',
  fontSize: '0.9rem',
  lineHeight: 1.5,
});

export const warningText = style({
  margin: 0,
  color: '#fde68a',
  fontSize: '0.9rem',
  lineHeight: 1.5,
});

export const endpointCard = style({
  borderRadius: '14px',
  border: '1px solid #1e293b',
  backgroundColor: '#111827',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
});

export const secretCard = style({
  borderRadius: '14px',
  border: '1px solid rgba(125, 211, 252, 0.26)',
  backgroundColor: 'rgba(8, 47, 73, 0.35)',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
});

export const logList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const logCard = style({
  borderRadius: '14px',
  border: '1px solid #1e293b',
  backgroundColor: '#111827',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
});

export const warningPanel = style({
  borderRadius: '14px',
  border: '1px solid rgba(250, 204, 21, 0.24)',
  backgroundColor: 'rgba(113, 63, 18, 0.18)',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
});

export const warningTitle = style({
  margin: 0,
  color: '#fde68a',
  fontSize: '0.9rem',
  fontWeight: 700,
});

export const runbookList = style({
  margin: 0,
  paddingLeft: '1.1rem',
  display: 'grid',
  gap: '0.5rem',
  color: '#cbd5e1',
});

export const runbookStep = style({
  fontSize: '0.84rem',
  lineHeight: 1.55,
});
