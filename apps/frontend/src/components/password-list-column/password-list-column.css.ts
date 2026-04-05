import { style } from '@vanilla-extract/css';

export const passwordListColumn = style({
  width: '300px',
  minWidth: '300px',
  backgroundColor: '#0f172a',
  borderRight: '1px solid slateblue',
  borderLeft: '1px solid slateblue',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const passwordListHeader = style({
  padding: '1.25rem 1rem 0.75rem',
  borderBottom: '1px solid #16213e',
  flexShrink: 0,
});

export const vaultNameRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.75rem',
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const addPasswordButton = style({
  flexShrink: 0,
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: '1px solid #334155',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#64748b',
  fontSize: '1.125rem',
  lineHeight: 1,
  transition:
    'color 0.12s ease, border-color 0.12s ease, background-color 0.12s ease',
  selectors: {
    '&:hover': {
      color: '#a5b4fc',
      borderColor: '#667eea',
      backgroundColor: 'rgba(102,126,234,0.08)',
    },
  },
});

export const importLink = style({
  borderRadius: '999px',
  border: '1px solid rgba(125, 211, 252, 0.35)',
  color: '#7dd3fc',
  textDecoration: 'none',
  fontSize: '0.75rem',
  fontWeight: 800,
  padding: '0.3rem 0.7rem',
});

export const passwordListVaultName = style({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#e2e8f0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const searchWrapper = style({
  position: 'relative',
});

export const extensionPrompt = style({
  marginTop: '0.85rem',
  borderRadius: '14px',
  border: '1px solid rgba(56, 189, 248, 0.35)',
  background:
    'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 118, 110, 0.25))',
  padding: '0.8rem',
  display: 'grid',
  gap: '0.75rem',
});

export const extensionPromptBody = style({
  display: 'grid',
  gap: '0.35rem',
});

export const extensionPromptTitle = style({
  margin: 0,
  color: '#f8fafc',
  fontSize: '0.92rem',
  fontWeight: 700,
});

export const extensionPromptText = style({
  margin: 0,
  color: '#cbd5e1',
  fontSize: '0.82rem',
  lineHeight: 1.5,
});

export const extensionPromptLink = style({
  color: '#7dd3fc',
  fontSize: '0.82rem',
  fontWeight: 700,
  textDecoration: 'none',
});

export const extensionPromptDismiss = style({
  justifySelf: 'start',
  border: '1px solid #334155',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  borderRadius: '999px',
  padding: '0.3rem 0.7rem',
  fontSize: '0.76rem',
  cursor: 'pointer',
});

export const searchIcon = style({
  position: 'absolute',
  left: '0.625rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b',
  fontSize: '0.875rem',
  pointerEvents: 'none',
});

export const searchInput = style({
  width: '100%',
  padding: '0.5rem 0.625rem 0.5rem 2rem',
  backgroundColor: '#16213e',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',

  selectors: {
    '&::placeholder': {
      color: '#64748b',
    },
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
    },
  },
});

export const passwordListScroll = style({
  flex: 1,
  overflowY: 'auto',

  selectors: {
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#334155',
      borderRadius: '2px',
    },
  },
});

export const passwordItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  borderBottom: '1px solid #16213e',
  transition: 'background-color 0.12s ease',
  textAlign: 'left',

  selectors: {
    '&:hover': {
      backgroundColor: '#16213e',
    },
  },
});

export const passwordItemActive = style({
  backgroundColor: '#0f3460',
  borderLeft: '3px solid #667eea',
  paddingLeft: 'calc(1rem - 3px)',

  selectors: {
    '&:hover': {
      backgroundColor: '#0f3460',
    },
  },
});

export const passwordItemIcon = style({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  flexShrink: 0,
});

export const passwordItemContent = style({
  flex: 1,
  minWidth: 0,
});

export const passwordItemName = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#e2e8f0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const passwordItemNameActive = style({
  color: '#a5b4fc',
  fontWeight: 600,
});

export const passwordListEmpty = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  color: '#64748b',
  textAlign: 'center',
});

export const passwordListEmptyIcon = style({
  fontSize: '2rem',
  marginBottom: '0.75rem',
  opacity: 0.5,
});

export const passwordListEmptyText = style({
  fontSize: '0.875rem',
  lineHeight: 1.5,
});

export const emptyImportLink = style({
  marginTop: '0.85rem',
  color: '#7dd3fc',
  textDecoration: 'none',
  fontSize: '0.82rem',
  fontWeight: 700,
});
