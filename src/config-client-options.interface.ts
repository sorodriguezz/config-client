export interface ConfigClientOptions {
  repo: string;
  application: string;
  profile: string;
  auth?: {
    username: string;
    password: string;
  }
}
