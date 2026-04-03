import { style, globalStyle } from '@vanilla-extract/css';
import { roleBadgeColors } from '../../common/css/vars';

export const dialog = style({
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: 0,
  maxWidth: '600px',
  width: '90%',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  backgroundColor: '#16213e',
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
  borderBottom: '1px solid #1e293b',
});

export const dialogTitle = style({
  margin: 0,
  fontSize: '24px',
  fontWeight: 600,
  color: '#e2e8f0',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  fontSize: '32px',
  lineHeight: 1,
  cursor: 'pointer',
  color: '#64748b',
  padding: 0,
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
  },
});

export const dialogBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const bannerBase = style({
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid',
});

export const warningBanner = style([
  bannerBase,
  {
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    borderColor: '#fbbf24',
    color: '#fbbf24',
    fontSize: '14px',
    textAlign: 'justify',
  },
]);

export const errorBanner = style([
  bannerBase,
  {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: '#f87171',
    color: '#f87171',
  },
]);

export const successBanner = style([
  bannerBase,
  {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: '#4ade80',
    color: '#4ade80',
    textAlign: 'left',
  },
]);

export const memberInfo = style({
  padding: '12px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  border: '1px solid #334155',
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#e2e8f0',
});

export const roleBadge = style({
  display: 'inline-block',
  padding: '4px 8px',
  backgroundColor: roleBadgeColors.member.bg,
  color: roleBadgeColors.member.color,
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 500,
  marginTop: '4px',
});

export const confirmationText = style({
  margin: '16px 0 -8px',
  fontWeight: 500,
  color: '#94a3b8',
  textAlign: 'left',
});

export const operationList = style({
  margin: 0,
  textAlign: 'left',
  paddingLeft: '24px',
  color: '#64748b',
});

globalStyle(`${operationList} li`, {
  fontSize: '14px',
  lineHeight: 1.5,
});

export const progressSection = style({
  padding: '16px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  border: '1px solid #334155',
});

export const progressInfo = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
});

export const progressStage = style({
  fontSize: '14px',
  fontWeight: 500,
  color: '#94a3b8',
});

export const progressPercentage = style({
  fontSize: '14px',
  fontWeight: 600,
  color: '#667eea',
});

export const progressBarContainer = style({
  width: '100%',
  height: '8px',
  backgroundColor: '#0f172a',
  borderRadius: '4px',
  overflow: 'hidden',
});

export const progressBarFill = style({
  height: '100%',
  background: 'linear-gradient(90deg, #667eea, #764ba2)',
  transition: 'width 0.3s ease',
  borderRadius: '4px',
});

export const progressDescription = style({
  margin: '12px 0 0',
  fontSize: '13px',
  color: '#64748b',
  textAlign: 'center',
});

export const resultStats = style({
  margin: '12px 0 0',
  paddingLeft: '24px',
  listStyleType: 'disc',
});

globalStyle(`${resultStats} li`, {
  fontSize: '14px',
  color: '#4ade80',
});

export const dialogFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  paddingTop: '16px',
  borderTop: '1px solid #1e293b',
});

const buttonBase = style({
  padding: '10px 20px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '1px solid',
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const buttonSecondary = style([
  buttonBase,
  {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    borderColor: '#334155',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        borderColor: '#475569',
      },
    },
  },
]);

export const buttonDanger = style([
  buttonBase,
  {
    background: 'none',
    color: '#f87171',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#f87171',
      },
    },
  },
]);
