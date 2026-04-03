/**
 * Design Tokens — Dark Theme
 *
 * Single source of truth for colours and reusable style fragments.
 * Import this file from any *.css.ts to stay consistent with the app theme.
 *
 * Usage in a .css.ts file:
 *   import { colors, fragments } from '../../common/css/vars';
 *   export const card = style({ backgroundColor: colors.cardBg, ...fragments.card });
 */

// ─── Colour Palette ────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  pageBg: '#0f172a',
  cardBg: '#16213e',
  surfaceBg: '#1e293b',
  hoverBg: '#0f3460',

  // Borders
  borderDefault: '#1e293b',
  borderStrong: '#334155',

  // Text
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textPlaceholder: '#475569',

  // Accent
  accent: '#667eea',
  accentPurple: '#764ba2',
  accentHover: '#a5b4fc',

  // Semantic — Error
  errorBg: 'rgba(239, 68, 68, 0.08)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  errorText: '#f87171',
  errorHoverBg: 'rgba(239, 68, 68, 0.15)',

  // Semantic — Warning
  warningBg: 'rgba(251, 191, 36, 0.06)',
  warningBorder: 'rgba(251, 191, 36, 0.35)',
  warningText: '#fbbf24',

  // Semantic — Info
  infoBg: 'rgba(102, 126, 234, 0.08)',
  infoBorder: 'rgba(102, 126, 234, 0.25)',
  infoText: '#93c5fd',

  // Semantic — Success
  successBg: 'rgba(74, 222, 128, 0.08)',
  successBorder: 'rgba(74, 222, 128, 0.3)',
  successText: '#4ade80',

  // Buttons
  btnGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  btnShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  btnShadowHover: '0 6px 16px rgba(102, 126, 234, 0.4)',
} as const;

// ─── Role Badge Colours ─────────────────────────────────────────────────────────

export const roleBadgeColors = {
  owner: { bg: 'rgba(74, 222, 128, 0.12)', color: '#4ade80' },
  manager: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24' },
  member: { bg: 'rgba(102, 126, 234, 0.12)', color: '#a5b4fc' },
} as const;

// ─── Style Fragments (plain objects — spread into style({...})) ─────────────────

export const fragments = {
  // Modal / card container
  card: {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.borderDefault}`,
    borderRadius: '16px' as const,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },

  // Sticky modal header
  modalHeader: {
    backgroundColor: colors.cardBg,
    borderBottom: `1px solid ${colors.borderDefault}`,
  },

  // Sticky modal footer
  modalFooter: {
    backgroundColor: colors.cardBg,
    borderTop: `1px solid ${colors.borderDefault}`,
  },

  // Text input / textarea / select
  input: {
    backgroundColor: colors.surfaceBg,
    border: `1px solid ${colors.borderStrong}`,
    color: colors.textPrimary,
    selectors: {
      '&::placeholder': { color: colors.textPlaceholder },
      '&:focus': {
        borderColor: colors.accent,
        boxShadow: `0 0 0 3px ${colors.infoBg}`,
        outline: 'none' as const,
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed' as const,
      },
    },
  },

  // Secondary / cancel button
  btnSecondary: {
    backgroundColor: 'transparent' as const,
    color: colors.textSecondary,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '8px' as const,
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: colors.surfaceBg,
        color: colors.textPrimary,
      },
      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' as const },
    },
  },

  // Danger / delete button
  btnDanger: {
    background: 'none' as const,
    color: colors.errorText,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: '8px' as const,
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: colors.errorHoverBg,
      },
      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' as const },
    },
  },

  // Close "×" icon button
  btnClose: {
    background: 'none' as const,
    border: 'none' as const,
    color: colors.textTertiary,
    cursor: 'pointer' as const,
    borderRadius: '8px' as const,
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: colors.surfaceBg,
        color: colors.textPrimary,
      },
    },
  },

  // Generic icon-only button
  btnIcon: {
    background: 'none' as const,
    border: 'none' as const,
    color: colors.textTertiary,
    cursor: 'pointer' as const,
    borderRadius: '6px' as const,
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: colors.surfaceBg,
        color: colors.textPrimary,
      },
      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' as const },
    },
  },

  // Error message box
  errorBox: {
    background: colors.errorBg,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: '8px' as const,
  },

  // Warning message box
  warningBox: {
    background: colors.warningBg,
    border: `1px solid ${colors.warningBorder}`,
    borderRadius: '8px' as const,
  },

  // Info message box
  infoBox: {
    background: colors.infoBg,
    border: `1px solid ${colors.infoBorder}`,
    borderRadius: '8px' as const,
  },

  // Success message box
  successBox: {
    background: colors.successBg,
    border: `1px solid ${colors.successBorder}`,
    borderRadius: '8px' as const,
  },

  // Progress bar track
  progressBarTrack: {
    backgroundColor: colors.surfaceBg,
    borderRadius: '4px' as const,
    overflow: 'hidden' as const,
  },

  // Progress bar fill
  progressBarFill: {
    background: colors.btnGradient,
    height: '100%',
    transition: 'width 0.3s ease',
  },

  // Loading spinner
  spinner: {
    border: `4px solid ${colors.surfaceBg}`,
    borderTopColor: colors.accent,
    borderRadius: '50%' as const,
    animation: 'spin 1s linear infinite',
  },

  // List item row (e.g. password-item, member-item)
  listItem: {
    backgroundColor: colors.surfaceBg,
    border: '1px solid transparent',
    borderRadius: '8px' as const,
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: colors.hoverBg,
        borderColor: colors.borderStrong,
      },
    },
  },

  // Field value read-only container
  fieldValueContainer: {
    backgroundColor: colors.pageBg,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '8px' as const,
  },
} as const;
