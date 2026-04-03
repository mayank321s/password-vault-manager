import { style } from '@vanilla-extract/css';
import { fragments } from '../../common/css/vars';

export const detailPlaceholder = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  textAlign: 'center',
  padding: '2rem',
});

export const detailPlaceholderIcon = style({
  fontSize: '3rem',
  marginBottom: '1rem',
  opacity: 0.35,
});

export const detailPlaceholderText = style({
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: '#475569',
  marginBottom: '0.375rem',
});

export const detailPlaceholderSubtext = style({
  fontSize: '0.8125rem',
  color: '#64748b',
});

export const detailScrollArea = style({
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',

  selectors: {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#334155',
      borderRadius: '3px',
    },
  },
});

export const detailCard = style({
  backgroundColor: '#16213e',
  borderRadius: '12px',
  border: '1px solid #1e293b',
  padding: '0.5rem 1rem',
  textAlign: 'left',
  marginBottom: '1rem',
});

export const detailSectionLabel = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.5rem',
  marginLeft: '0.5rem',
});

export const detailFieldRow = style({
  margin: '1rem',
  textAlign: 'left',
});

export const iconButton = style({
  background: 'none',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: '#94a3b8',
  transition: 'all 0.15s ease',

  selectors: {
    '&:hover': {
      backgroundColor: '#0f3460',
      borderColor: '#334155',
      color: '#e2e8f0',
    },
  },
});

export const detailHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const detailHeaderIcon = style({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  flexShrink: 0,
});

export const detailHeaderTitle = style({
  fontSize: '1.125rem',
  fontWeight: 700,
  color: '#e2e8f0',
  marginBottom: '0.25rem',
});

export const detailHeaderType = style({
  fontSize: '0.75rem',
  color: '#64748b',
  textAlign: 'left',
  textTransform: 'capitalize',
});

export const sharedUsersList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
});

export const sharedUserItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  backgroundColor: '#0f3460',
  borderRadius: '8px',
  border: '1px solid #1e293b',
});

export const sharedUserAvatar = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#ffffff',
  flexShrink: 0,
});

export const sharedUserName = style({
  flex: 1,
  minWidth: 0,
});

export const sharedUserNameText = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#e2e8f0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const sharedUserEmail = style({
  fontSize: '0.75rem',
  color: '#64748b',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const permissionBadge = style({
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '2px 7px',
  borderRadius: '4px',
  flexShrink: 0,
});

export const permissionOwner = style({
  backgroundColor: 'rgba(124, 58, 237, 0.2)',
  color: '#a78bfa',
});

export const permissionViewer = style({
  backgroundColor: 'rgba(3, 105, 161, 0.2)',
  color: '#38bdf8',
});

// Collapsible section
export const collapsibleSection = style({
  marginBottom: '0.25rem',
});

export const collapsibleHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.625rem 0',
  textAlign: 'left',
  color: '#94a3b8',

  selectors: {
    '&:hover': {
      color: '#e2e8f0',
    },
  },
});

export const collapsibleLabel = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const collapsibleChevron = style({
  fontSize: '0.625rem',
  transition: 'transform 0.15s ease',
});

export const collapsibleChevronOpen = style({
  transform: 'rotate(90deg)',
});

export const collapsibleContent = style({
  paddingBottom: '0.25rem',
});

export const noteText = style({
  fontFamily: 'monospace',
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  backgroundColor: '#0f172a',
  borderRadius: '8px',
  border: '1px solid #1e293b',
  padding: '0.5rem 0',
  marginTop: '0.75rem',
  maxHeight: '400px',
  overflowX: 'auto',
  overflowY: 'auto',

  selectors: {
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
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

export const noteLine = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0',
});

export const noteLines = style({
  minWidth: 'max-content',
});

export const noteLineNumber = style({
  width: '2.75rem',
  minWidth: '2.75rem',
  textAlign: 'right',
  paddingRight: '1rem',
  color: '#334155',
  userSelect: 'none',
  flexShrink: 0,
  position: 'sticky',
  left: 0,
  backgroundColor: '#0f172a',
});

export const noteLineContent = style({
  color: '#cbd5e1',
  whiteSpace: 'pre',
  flexShrink: 0,
  paddingRight: '1rem',
});

export const fieldValueRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  padding: '0.5rem 0.75rem',
  marginBottom: '0.25rem',
});

export const fieldValueText = style({
  fontSize: '0.875rem',
  color: '#e2e8f0',
  fontFamily: 'monospace',
  letterSpacing: '0.02em',
  wordBreak: 'break-all',
  flex: 1,
  minWidth: 0,
});

export const metaGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
});

export const metaItem = style({});

export const metaLabel = style({
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.25rem',
});

export const metaValue = style({
  fontSize: '0.8125rem',
  color: '#cbd5e1',
});

export const sharingVaultRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  backgroundColor: '#0f3460',
  borderRadius: '8px',
  border: '1px solid #1e293b',
  marginBottom: '0.5rem',
});

export const sharingVaultName = style({
  flex: 1,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#e2e8f0',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const sharingVaultIcon = style({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  flexShrink: 0,
});

export const settingsLink = style({
  fontSize: '0.75rem',
  color: '#64748b',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem 0.375rem',
  borderRadius: '4px',
  transition: 'color 0.15s ease',
  flexShrink: 0,
  textDecoration: 'none',

  selectors: {
    '&:hover': {
      color: '#94a3b8',
    },
  },
});

export const decryptErrorText = style({
  fontSize: '0.8125rem',
  color: '#f87171',
  padding: '0.5rem 0',
});

export const decryptingText = style({
  fontSize: '0.8125rem',
  color: '#64748b',
  padding: '0.5rem 0',
});

export const detailHeaderText = style({
  flex: 1,
  minWidth: 0,
});

export const editButton = style({
  background: 'none',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '0.375rem 0.75rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#94a3b8',
  flexShrink: 0,
  transition: 'all 0.15s ease',

  selectors: {
    '&:hover': {
      backgroundColor: '#0f3460',
      borderColor: '#475569',
      color: '#e2e8f0',
    },
  },
});

export const iconButtonCopied = style({
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  borderColor: '#10b981',
  color: '#34d399',

  selectors: {
    '&:disabled': {
      cursor: 'default',
      opacity: 1,
    },
  },
});

// ── Sharing section ──

export const sharingIndividualHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.625rem',
});

export const sharingIndividualLabel = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const shareToggleButton = style({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#a5b4fc',
  background: 'transparent',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '0.2rem 0.6rem',
  cursor: 'pointer',

  selectors: {
    '&:hover': {
      background: '#1e293b',
      borderColor: '#667eea',
    },
  },
});

export const shareFormPanel = style({
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  padding: '0.875rem',
  marginBottom: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
});

export const shareInputRow = style({
  display: 'flex',
  gap: '0.5rem',
});

export const searchInputWrapper = style({
  position: 'relative',
  flex: 1,
  minWidth: 0,
});

export const shareSearchInput = style({
  padding: '0.5rem 0.75rem',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s ease',

  selectors: {
    '&::placeholder': { color: '#64748b' },
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const suggestionDropdown = style({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  backgroundColor: '#16213e',
  border: '1px solid #334155',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  zIndex: 50,
  overflow: 'hidden',
  maxHeight: '180px',
  overflowY: 'auto',
});

export const suggestionItem = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '0.6rem 0.875rem',
  cursor: 'pointer',
  borderBottom: '1px solid #1e293b',

  selectors: {
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { backgroundColor: '#0f3460' },
  },
});

export const suggestionEmail = style({
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#e2e8f0',
});

export const suggestionUsername = style({
  fontSize: '0.75rem',
  color: '#64748b',
  marginTop: '0.1rem',
});

export const noSuggestions = style({
  padding: '0.75rem 0.875rem',
  fontSize: '0.8125rem',
  color: '#64748b',
  textAlign: 'center',
});

export const shareFormActions = style({
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'flex-end',
});

export const btnSecondary = style({
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.4rem 0.875rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',

  selectors: {
    '&:hover': { background: '#16213e', color: '#e2e8f0' },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const sharedUserGrantedBy = style({
  fontSize: '0.6875rem',
  color: '#475569',
  marginTop: '0.125rem',
});

export const removeShareButton = style({
  background: 'none',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  borderRadius: '6px',
  padding: '0.2rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.6875rem',
  color: '#f87171',
  flexShrink: 0,
  transition: 'all 0.15s ease',

  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const deleteButton = style({
  ...fragments.btnDanger,
  borderRadius: '6px',
  padding: '0.375rem 0.75rem',
  fontSize: '0.75rem',
  flexShrink: 0,
});
