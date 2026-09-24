export interface AppEnvironment {
  readonly production: boolean;
  readonly name: 'development' | 'staging' | 'production';
  readonly configUrl: string;
  readonly appVersion: string;
}
