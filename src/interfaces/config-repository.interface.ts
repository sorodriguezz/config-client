export interface IConfigRepository {
  application: string;
  profile: string;
  auth?: {
    username: string;
    password: string;
  };
}
