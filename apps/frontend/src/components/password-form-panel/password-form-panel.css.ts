import { style } from '@vanilla-extract/css';

export const panel = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: '#0f172a',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.25rem 1.5rem 1rem',
  borderBottom: '1px solid #1e293b',
  flexShrink: 0,
});

export const headerTitle = style({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#e2e8f0',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#64748b',
  fontSize: '1.125rem',
  lineHeight: 1,
  padding: '0.25rem',
  borderRadius: '4px',
  transition: 'color 0.12s ease',
  selectors: {
    '&:hover': { color: '#e2e8f0' },
  },
});

export const scrollArea = style({
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  selectors: {
    '&::-webkit-scrollbar': { width: '4px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      background: '#334155',
      borderRadius: '2px',
    },
  },
});

// ── Action row (mode toggle + save button) ───────────────────────────────────

export const actionRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
});

// ── Mode toggle ─────────────────────────────────────────────────────────────

export const modeToggle = style({
  display: 'flex',
  gap: '0',
  backgroundColor: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  padding: '3px',
  alignSelf: 'flex-start',
});

export const modeButton = style({
  padding: '0.375rem 1rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: '#64748b',
  background: 'none',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'color 0.12s ease, background-color 0.12s ease',
  selectors: {
    '&:hover': { color: '#94a3b8' },
  },
});

export const modeButtonActive = style({
  backgroundColor: '#1e293b',
  color: '#e2e8f0',
  selectors: {
    '&:hover': { color: '#e2e8f0' },
  },
});

// ── Form section ─────────────────────────────────────────────────────────────

export const formSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
});

export const fieldLabel = style({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#94a3b8',
  textAlign: 'left',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
});

export const fieldInput = style({
  padding: '0.5rem 0.75rem',
  backgroundColor: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  selectors: {
    '&::placeholder': { color: '#475569' },
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102,126,234,0.15)',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const fieldInputError = style({
  borderColor: 'rgba(239,68,68,0.5)',
  selectors: {
    '&:focus': {
      borderColor: 'rgba(239,68,68,0.7)',
      boxShadow: '0 0 0 3px rgba(239,68,68,0.12)',
    },
  },
});

export const errorText = style({
  fontSize: '0.75rem',
  color: '#f87171',
  marginTop: '0.125rem',
});

export const noteEditorWrapper = style({
  position: 'relative',
});

export const noteLineNumbers = style({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: '2.5rem',
  overflowY: 'hidden',
  borderRight: '1px solid #1e293b',
  backgroundColor: 'rgba(18,31,57)',
  borderRadius: '8px 0 0 8px',
  paddingTop: '0.625rem',
  paddingBottom: '0.625rem',
  userSelect: 'none',
  pointerEvents: 'none',
});

export const noteLineNumber = style({
  display: 'block',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  lineHeight: '1.6',
  textAlign: 'right',
  paddingRight: '0.5rem',
  color: '#334155',
});

export const noteTextarea = style({
  paddingTop: '0.625rem',
  paddingBottom: '0.625rem',
  paddingLeft: '2.75rem',
  paddingRight: '0.75rem',
  backgroundColor: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  outline: 'none',
  width: '100%',
  minHeight: '400px',
  resize: 'vertical',
  boxSizing: 'border-box',
  fontFamily: 'monospace',
  lineHeight: '1.6',
  whiteSpace: 'nowrap',
  overflowX: 'auto',
  overflowY: 'auto',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  selectors: {
    '&::placeholder': { color: '#475569' },
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102,126,234,0.15)',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const charCounter = style({
  fontSize: '0.6875rem',
  color: '#475569',
  textAlign: 'right',
  marginTop: '0.25rem',
});

export const charCounterWarning = style({
  color: '#f59e0b',
});

export const charCounterMax = style({
  color: '#f87171',
});

// ── Dynamic fields ────────────────────────────────────────────────────────────

export const dynamicFieldsSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
});

export const dynamicFieldsLabel = style({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#94a3b8',
  textAlign: 'left',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.25rem',
});

export const dynamicFieldRow = style({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
});

export const dynamicFieldLabelInput = style({
  flex: '0 0 38%',
  padding: '0.5rem 0.625rem',
  backgroundColor: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  color: '#e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
  selectors: {
    '&::placeholder': { color: '#475569' },
    '&:focus': { borderColor: '#667eea' },
    '&:disabled': { opacity: 0.5 },
  },
});

export const dynamicFieldValueInput = style({
  flex: 1,
  padding: '0.5rem 0.625rem',
  backgroundColor: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  color: '#e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
  selectors: {
    '&::placeholder': { color: '#475569' },
    '&:focus': { borderColor: '#667eea' },
    '&:disabled': { opacity: 0.5 },
  },
});

export const removeFieldButton = style({
  flexShrink: 0,
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#64748b',
  fontSize: '0.875rem',
  transition: 'color 0.12s ease, border-color 0.12s ease',
  selectors: {
    '&:hover': {
      color: '#f87171',
      borderColor: 'rgba(239,68,68,0.4)',
    },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const addFieldButton = style({
  alignSelf: 'flex-start',
  marginTop: '0.25rem',
  padding: '0.375rem 0.75rem',
  backgroundColor: 'transparent',
  border: '1px dashed #334155',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  color: '#64748b',
  cursor: 'pointer',
  transition: 'color 0.12s ease, border-color 0.12s ease',
  selectors: {
    '&:hover': { color: '#a5b4fc', borderColor: '#667eea' },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

// ── Save button ───────────────────────────────────────────────────────────────

export const saveButton = style({
  padding: '0.375rem 1.125rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#fff',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'opacity 0.12s ease, box-shadow 0.12s ease',
  selectors: {
    '&:hover:not(:disabled)': {
      opacity: 0.92,
      boxShadow: '0 4px 12px rgba(102,126,234,0.35)',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const errorBanner = style({
  padding: '0.625rem 0.875rem',
  backgroundColor: 'rgba(239,68,68,0.08)',
  border: '1px solid rgba(239,68,68,0.25)',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  color: '#f87171',
});

// ── Shared users section ──────────────────────────────────────────────────────

export const sharedSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const sharedSectionTitle = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const sharedEmpty = style({
  fontSize: '0.8125rem',
  color: '#475569',
  fontStyle: 'italic',
});
