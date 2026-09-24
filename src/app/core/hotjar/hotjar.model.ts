/** Minimal interface the HotjarService drives — wraps the injected script loader. */
export interface HotjarSdk {
  init(siteId: string): void;
}
