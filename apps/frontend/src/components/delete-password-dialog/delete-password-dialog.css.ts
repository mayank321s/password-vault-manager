import { globalStyle, style } from '@vanilla-extract/css';
import { colors, fragments } from '../../common/css/vars';

export const dialog = style({
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: '12px',
  padding: 0,
  maxWidth: '420px',
  width: '90%',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  backgroundColor: colors.cardBg,
});

globalStyle(`${dialog}::backdrop`, {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(4px)',
});

export const dialogContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '24px',
});

export const dialogHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '16px',
  borderBottom: `1px solid ${colors.borderDefault}`,
});

export const dialogTitle = style({
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: colors.errorText,
});

export const closeButton = style({
  ...fragments.btnClose,
  fontSize: '24px',
  lineHeight: 1,
  padding: 0,
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const warningBanner = style({
  backgroundColor: colors.errorBg,
  border: `1px solid ${colors.errorBorder}`,
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '0.8125rem',
  color: colors.errorText,
});

export const passwordName = style({
  padding: '10px 14px',
  backgroundColor: colors.surfaceBg,
  borderRadius: '8px',
  border: `1px solid ${colors.borderStrong}`,
  fontSize: '0.875rem',
  color: colors.textPrimary,
  fontWeight: 500,
});

export const errorBanner = style({
  ...fragments.errorBox,
  padding: '10px 14px',
  fontSize: '0.8125rem',
  color: colors.errorText,
});

export const dialogFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  paddingTop: '16px',
});

export const buttonSecondary = style({
  ...fragments.btnSecondary,
  padding: '8px 18px',
  fontSize: '0.875rem',
});

export const buttonDanger = style({
  ...fragments.btnDanger,
  padding: '8px 18px',
  fontSize: '0.875rem',
});
