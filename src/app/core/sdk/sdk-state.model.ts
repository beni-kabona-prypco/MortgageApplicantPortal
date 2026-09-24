/**
 * Lifecycle of a third-party SDK wrapper service (RUM, logs, Hotjar, …).
 *
 * - `idle`     — SDK not yet initialized.
 * - `disabled` — runtime config has `enabled: false` (or credentials missing);
 *                the service is a permanent no-op — calls are dropped.
 * - `ready`    — SDK initialized; calls forward to the vendor.
 */
export type SdkStatus = 'idle' | 'disabled' | 'ready';
