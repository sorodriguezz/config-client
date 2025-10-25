export interface IConfigRepository {
  repo: string | undefined;
  application: string;
  profile: string;
  auth?: {
    username: string;
    password: string;
  };
}
