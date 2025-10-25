import { type Logger } from "@nestjs/common";

export interface ILoggingParams {
  url: string;
  repo?: string;
  application?: string;
  profile?: string;
}

export const logging = (logger: Logger, params: ILoggingParams) => {
  logger.verbose(`✅ Configuration loaded from Config Server: ${params.url}`);

  logger.verbose(params.repo);

  logger.verbose(`🗄️ Repository: ${params.repo}`);

  logger.verbose(`📦 Application: ${params.application}`);
  logger.verbose(`🗒️ Profile: ${params.profile}`);
};
