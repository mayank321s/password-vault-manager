import { style, globalStyle } from '@vanilla-extract/css';
import { colors, fragments } from '../../common/css/vars';

export const dialog = style({
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: '12px',
  padding: 0,
  maxWidth: '480px',
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
  gap: '24px',
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
  fontSize: '20px',
  fontWeight: 600,
  color: colors.errorText,
});

export const closeButton = style({
  ...fragments.btnClose,
  fontSize: '32px',
  lineHeight: 1,
  padding: 0,
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const dialogBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const warningBanner = style({
  backgroundColor: colors.errorBg,
  borderLeft: `4px solid ${colors.errorText}`,
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  color: colors.errorText,
  textAlign: 'justify',
});

export const errorBanner = style({
  ...fragments.errorBox,
  borderLeft: `4px solid ${colors.errorText}`,
  padding: '16px',
  color: colors.errorText,
});

export const vaultInfo = style({
  padding: '12px',
  backgroundColor: colors.surfaceBg,
  borderRadius: '8px',
  border: `1px solid ${colors.borderStrong}`,
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.6,
  color: colors.textPrimary,
});

export const confirmationText = style({
  margin: '0 0 -8px',
  fontWeight: 500,
  color: colors.textSecondary,
  textAlign: 'left',
  fontSize: '14px',
});

export const operationList = style({
  margin: 0,
  textAlign: 'left',
  paddingLeft: '24px',
  color: colors.textTertiary,
});

globalStyle(`${operationList} li`, {
  fontSize: '14px',
  lineHeight: 1.5,
});

export const dialogFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  paddingTop: '16px',
  borderTop: `1px solid ${colors.borderDefault}`,
});

export const buttonSecondary = style({
  ...fragments.btnSecondary,
  padding: '10px 20px',
  fontSize: '14px',
  border: `1px solid ${colors.borderStrong}`,
});

export const buttonDanger = style({
  ...fragments.btnDanger,
  padding: '10px 20px',
  fontSize: '14px',
  border: `1px solid ${colors.errorBorder}`,
});
