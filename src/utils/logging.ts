import { type Logger } from "@nestjs/common";

export interface ILoggingParams {
  url: string;
  repo?: string;
  application?: string;
  profile?: string;
}

export const logging = (logger: Logger, params: ILoggingParams) => {
  logger.log(`✅ Configuration loaded from Config Server: ${params.url}`);

  logger.log(params.repo);

  logger.log(`🗄️ Repository: ${params.repo}`);

  logger.log(`📦 Application: ${params.application}`);
  logger.log(`🗒️ Profile: ${params.profile}`);
};
