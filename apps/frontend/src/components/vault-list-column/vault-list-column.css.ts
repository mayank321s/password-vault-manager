import { style, keyframes } from '@vanilla-extract/css';

const dropdownFadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-4px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const vaultListColumn = style({
  width: '260px',
  minWidth: '260px',
  backgroundColor: '#0f172a',
  borderRight: '1px solid #16213e',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const vaultListHeader = style({
  padding: '1.25rem 1rem 0.75rem',
  borderBottom: '1px solid #16213e',
  flexShrink: 0,
});

export const vaultListTitle = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.75rem',
});

export const createVaultButton = style({
  width: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '0.625rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'opacity 0.2s ease, transform 0.15s ease',

  selectors: {
    '&:hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
});

export const vaultListScroll = style({
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem',

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

export const vaultItem = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
  marginBottom: '2px',

  selectors: {
    '&:hover': {
      backgroundColor: '#16213e',
    },
  },
});

export const vaultItemActive = style({
  backgroundColor: '#0f3460',

  selectors: {
    '&:hover': {
      backgroundColor: '#0f3460',
    },
  },
});

export const vaultItemIcon = style({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: '#334155',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  flexShrink: 0,
});

export const vaultItemIconActive = style({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
});

export const vaultItemContent = style({
  flex: 1,
  minWidth: 0,
  paddingRight: '1.5rem',
});

export const vaultItemName = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#e2e8f0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textAlign: 'left',
  textOverflow: 'ellipsis',
});

export const vaultItemNameActive = style({
  color: '#ffffff',
  fontWeight: 600,
});

export const vaultItemSettingsButton = style({
  bottom: '6px',
  right: '8px',
  width: '22px',
  height: '22px',
  borderRadius: '4px',
  border: 'none',
  color: '#f8fafc',
  cursor: 'pointer',
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12pt',
  transition: 'background-color 0.15s ease, color 0.15s ease',
  padding: 0,
  lineHeight: 1,
  minHeight: '22px',
  minWidth: '22px',

  selectors: {
    [`${vaultItem}:hover &`]: {
      display: 'flex',
      color: '#f8fafc',
      backgroundColor: 'transparent',
    },
  },
});

export const vaultListLoadingItem = style({
  height: '54px',
  backgroundColor: '#16213e',
  borderRadius: '8px',
  marginBottom: '2px',
  opacity: 0.5,
});

// ============================================
// User Profile Banner
// ============================================

export const userBannerWrapper = style({
  position: 'relative',
  borderBottom: '1px solid #16213e',
  flexShrink: 0,
});

export const userBanner = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  padding: '0.875rem 1rem',
});

export const userAvatar = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: '#ffffff',
  flexShrink: 0,
});

export const userInfo = style({
  flex: 1,
  minWidth: 0,
  textAlign: 'left',
});

export const userDisplayName = style({
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#e2e8f0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'capitalize',
});

export const userEmail = style({
  fontSize: '0.6875rem',
  color: '#64748b',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '1px',
});

export const userMenuButton = style({
  width: '24px',
  height: '24px',
  borderRadius: '6px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  flexShrink: 0,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  lineHeight: 1,
  padding: 0,

  selectors: {
    '&:hover': {
      backgroundColor: '#16213e',
      color: '#94a3b8',
    },
  },
});

export const userDropdown = style({
  position: 'absolute',
  top: 'calc(100% - 4px)',
  left: '0.5rem',
  right: '0.5rem',
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  zIndex: 100,
  overflow: 'hidden',
  animation: `${dropdownFadeIn} 0.12s ease`,
});

export const userDropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  width: '100%',
  padding: '0.625rem 0.875rem',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#cbd5e1',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.12s ease, color 0.12s ease',

  selectors: {
    '&:hover': {
      backgroundColor: '#1e293b',
      color: '#f1f5f9',
    },
  },
});

export const userDropdownItemDanger = style({
  color: '#f87171',

  selectors: {
    '&:hover': {
      backgroundColor: '#1e293b',
      color: '#fca5a5',
    },
  },
});

export const userDropdownDivider = style({
  height: '1px',
  backgroundColor: '#1e293b',
  margin: '2px 0',
});

export const vaultListDivider = style({
  height: '1px',
  backgroundColor: '#365196',
  margin: '0.5rem 0',
});
