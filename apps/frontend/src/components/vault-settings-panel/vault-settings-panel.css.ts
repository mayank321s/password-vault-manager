import { style } from '@vanilla-extract/css';
import { colors, fragments } from '../../common/css/vars';

export const settingsScrollArea = style({
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
  borderLeft: '1px solid slateblue',

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

export const settingsCard = style({
  backgroundColor: '#16213e',
  borderRadius: '12px',
  border: '1px solid #1e293b',
  padding: '1.5rem',
  marginBottom: '1rem',
});

export const settingsVaultName = style({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#e2e8f0',
  marginBottom: '0.375rem',
});

export const settingsVaultMeta = style({
  fontSize: '0.8125rem',
  color: '#64748b',
  textAlign: 'left',
});

export const settingsCardHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

export const deleteVaultButton = style({
  ...fragments.btnDanger,
  padding: '0.375rem 0.75rem',
  fontSize: '0.75rem',
  border: `1px solid ${colors.errorBorder}`,
});

export const membersList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const memberItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  backgroundColor: '#0f3460',
  borderRadius: '10px',
  border: '1px solid #1e293b',
});

export const memberAvatar = style({
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#ffffff',
  flexShrink: 0,
});

export const memberInfo = style({
  flexDirection: 'row',

  display: 'flex',

  width: '100%',
});

export const memberName = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#e2e8f0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: '100px',
  textAlign: 'left',
  marginLeft: '10px',
});

export const memberEmail = style({
  fontSize: '0.75rem',
  color: '#98b1df',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: '100px',
  textAlign: 'left',
  marginLeft: '10px',
  position: 'relative',
  top: '2px',
});

export const memberActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexShrink: 0,
});

export const currentUserBadge = style({
  fontSize: '0.75rem',
  color: '#85affe',
  fontWeight: 400,
  marginLeft: '0.375rem',
});

export const roleSelect = style({
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  color: '#94a3b8',
  cursor: 'pointer',
  outline: 'none',
  fontWeight: 500,

  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&:focus': {
      borderColor: '#667eea',
    },
  },
});

export const removeButton = style({
  background: 'none',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  borderRadius: '6px',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: '#f87171',
  transition: 'all 0.15s ease',
  fontWeight: 500,

  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
});

export const addMemberInputRow = style({
  display: 'flex',
  gap: '0.5rem',
});

export const addMemberEmailInput = style({
  padding: '0.5rem 0.75rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  minWidth: 0,
  width: '100%',

  selectors: {
    '&::placeholder': {
      color: '#64748b',
    },
    '&:focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const addMemberRoleSelect = style({
  padding: '0.5rem 0.75rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#94a3b8',
  outline: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  minWidth: '150px',

  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&:focus': {
      borderColor: '#667eea',
    },
  },
});

export const membersHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.75rem',
});

export const membersTitle = style({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const addMemberToggleButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
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

export const addMemberInlinePanel = style({
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  padding: '0.875rem',
  marginBottom: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
});

export const addMemberInlineActions = style({
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
    '&:hover': {
      background: '#16213e',
      color: '#e2e8f0',
    },
  },
});

export const searchInputWrapper = style({
  position: 'relative',
  flex: 1,
  minWidth: 0,
});

export const suggestionDropdown = style({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  backgroundColor: '#16213e',
  border: '1px solid #334155',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  zIndex: 50,
  overflow: 'hidden',
  maxHeight: '200px',
  overflowY: 'auto',
});

export const suggestionItem = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '0.6rem 0.875rem',
  cursor: 'pointer',
  borderBottom: '1px solid #1e293b',

  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: '#0f3460',
    },
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
