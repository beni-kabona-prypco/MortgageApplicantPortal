/**
 * Minimal shape of the Amplitude browser SDK consumed by the buyer portal.
 * Kept narrow on purpose so tests can supply a `jasmine.createSpyObj` mock
 * via the `AMPLITUDE_SDK` token without touching the real SDK.
 *
 * No user-identity methods (`setUserId`, `setUserProperties`) — the buyer
 * portal is unauthenticated. Event tracking methods will be added with the
 * analytics events ticket.
 */
export interface AmplitudeSdk {
  init(apiKey: string): void;
  track(eventName: string, properties?: Readonly<Record<string, unknown>>): void;
  reset(): void;
}
