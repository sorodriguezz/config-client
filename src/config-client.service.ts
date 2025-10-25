import { Inject, Injectable, Logger } from "@nestjs/common";

import { nestConfigServerUseCase } from "./use-case/nest-config-server.use-case";
import { springConfigServerUseCase } from "./use-case/spring-config-server.use-case";
import { logging } from "./utils/logging";

import type { IConfigOptions } from "./interfaces/config-options.interface";

@Injectable()
export class ConfigClientService {
  private logger = new Logger(ConfigClientService.name);

  constructor(
    @Inject("CONFIG_VALUES") private config: Record<string, string>
  ) {}

  get(key: string): string {
    return this.config[key] || process.env[key] || "";
  }

  async getRepositories({ url, config, options }: IConfigOptions) {
    const allConfigs: Record<string, any> = {};

    for (const option of options) {
      const { repo, application, profile } = option;

      try {
        const useCases = {
          "nest-config-server": nestConfigServerUseCase,
          "spring-config-server": springConfigServerUseCase,
        };

        const response = await useCases[config.type](url, option);
        const data = response.data;

        Object.entries(data).forEach(([key, value]) => {
          if (!process.env[key]) {
            process.env[key] = String(value);
          }
          allConfigs[key] = value;
        });

        if (config.logging) {
          logging(this.logger, {
            url,
            repo,
            application,
            profile,
          });
        }

        this.logger.log(`Configuration loaded`);
      } catch (err: any) {
        this.logger.error("Error cargando configuración remota:", err.message);
      }
    }
  }
}
