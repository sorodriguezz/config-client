export type IConfigRepository =
  | {
      type: "default";
      repo: string;
      application: string;
      profile: string;
      auth?: {
        username: string;
        password: string;
      };
    }
  | {
      type: "spring-config-server";
      repo?: string;
      application: string;
      profile: string;
      auth?: {
        username: string;
        password: string;
      };
    };
