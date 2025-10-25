import { Inject, Injectable, Logger } from "@nestjs/common";

import { nestConfigServerUseCase } from "./use-case/nest-config-server.use-case";
import { springConfigServerUseCase } from "./use-case/spring-config-server.use-case";
import { logging } from "./utils/logging";

import type { IConfigServer } from "./interfaces/config-server.interface";

@Injectable()
export class ConfigClientService {
  private logger = new Logger(ConfigClientService.name);

  get(key: string, configs: Record<string, any>): string {
    return configs[key] || process.env[key] || "";
  }

  static getConfig(key: string, configs: Record<string, any>): string {
    return configs[key] || process.env[key] || "";
  }

  async getMultipleServers(servers: IConfigServer[]) {
    const allConfigs: Record<string, any> = {};

    for (const server of servers) {
      const { url, type, logging: enableLogging, alias, repositories } = server;

      for (const repository of repositories) {
        const { repo, application, profile } = repository;

        try {
          const useCases = {
            "nest-config-server": nestConfigServerUseCase,
            "spring-config-server": springConfigServerUseCase,
          };

          const response = await useCases[type](url, repository);
          const data = response.data;

          Object.entries(data).forEach(([key, value]) => {
            const finalKey = alias ? `${alias}.${key}` : key;

            if (!process.env[finalKey]) {
              process.env[finalKey] = String(value);
            }
            allConfigs[finalKey] = value;
          });

          if (enableLogging) {
            logging(this.logger, {
              url,
              repo,
              application,
              profile,
            });
          }

          this.logger.log("Configuration loaded");
        } catch (err: any) {
          this.logger.error(
            `Error loading configuration from ${url} - ${application}:`,
            err.message
          );
        }
      }
    }

    return allConfigs;
  }
}
