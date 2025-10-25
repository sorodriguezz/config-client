import { type Logger } from "@nestjs/common";

export interface ILoggingParams {
  url: string;
  repo?: string;
  application?: string;
  profile?: string;
  auth?: any;
}

export const logging = (logger: Logger, params: ILoggingParams) => {
  logger.log(`✅ URL Config Server: ${params.url}`);

  if (params.repo) {
    logger.log(`🗄️ Repository: ${params.repo}`);
  }

  logger.log(`📦 Application: ${params.application}`);
  logger.log(`🗒️ Profile: ${params.profile}`);

  logger.log(`🔐 Ath  basic: ${params.auth ? "✅" : "❌"}`);
};
