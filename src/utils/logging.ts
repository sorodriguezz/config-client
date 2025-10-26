import type { Logger } from "@nestjs/common";

export interface ILoggingParams {
  url: string;
  repo?: string;
  application?: string;
  profile?: string;
  auth?: any;
  httpClient?: string;
}

export const logging = (logger: Logger, params: ILoggingParams) => {
  const paramLog = {
    url: `✅ URL Config Server: ${params.url}`,
    repo: `🗄️ Repository: ${params.repo}`,
    application: `📦 Application: ${params.application}`,
    profile: `🗒️ Profile: ${params.profile}`,
    auth: `🔐 Auth basic: ${params.auth ? "On" : "Off"}`,
    httpClient: `🌐 HTTP Client: ${params.httpClient}`,
  };

  for (const key in paramLog) {
    if (params[key as keyof typeof params] !== undefined) {
      logger.log(paramLog[key as keyof typeof paramLog]);
    }
  }
};
