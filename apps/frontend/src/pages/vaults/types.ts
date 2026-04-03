export type DashboardMode = 'passwords' | 'settings';

export interface BatchProgressInfo {
  readonly stage: string;
  readonly processedPasswords: number;
  readonly totalPasswords: number;
}
