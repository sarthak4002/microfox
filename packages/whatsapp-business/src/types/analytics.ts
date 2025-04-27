export interface AnalyticsOptions {
  start?: string;
  end?: string;
  granularity?: 'DAY' | 'HOUR' | 'MONTH';
  [key: string]: any;
}
