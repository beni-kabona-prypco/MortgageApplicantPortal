export type NotificationLevel = 'success' | 'info' | 'warning' | 'error';

export interface NotificationConfig {
  message: string;
  /** Optional heading shown above the message. */
  title?: string;
  /** Overrides the DS toast's default auto-dismiss delay (ms). */
  durationMs?: number;
}
