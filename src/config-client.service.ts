import { Inject, Injectable, Logger } from "@nestjs/common";
import { defaultUseCase } from "./use-case/default.use-case";
import { springConfigServerUseCase } from "./use-case/spring-config-server.use-case";
import { type IConfigOptions } from "./interfaces/config-options.interface";

@Injectable()
export class ConfigClientService {
  private logger = new Logger(ConfigClientService.name);

  constructor(
    @Inject("CONFIG_VALUES") private config: Record<string, string>
  ) {}

  get(key: string): string {
    return this.config[key] || process.env[key] || "";
  }

  async getRepositories({ url, options }: IConfigOptions) {
    const allConfigs: Record<string, any> = {};

    for (const option of options) {
      const { repo, application, profile } = option;

      try {
        const useCases = {
          default: defaultUseCase,
          "spring-config-server": springConfigServerUseCase,
        };

        const response = await useCases[option.type](url, option);
        const data = response.data;

        Object.entries(data).forEach(([key, value]) => {
          if (!process.env[key]) {
            process.env[key] = String(value);
          }
          allConfigs[key] = value;
        });

        this.logger.log(`✅ Configuration loaded from Config Server: ${url}`);
        if (repo) this.logger.log(`🗄️ Repository: ${repo}`);
        this.logger.log(`📦 Application: ${application}`);
        this.logger.log(`🗒️ Profile: ${profile}`);
      } catch (err: any) {
        this.logger.error("Error cargando configuración remota:", err.message);
        throw err;
      }
    }
  }
}
