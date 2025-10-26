import { Injectable, Logger } from "@nestjs/common";

import { nestConfigServerUseCase } from "./use-case/nest-config-server.use-case";
import { springConfigServerUseCase } from "./use-case/spring-config-server.use-case";
import { logging } from "./utils/logging";
import { DefaultHttpClient } from "./adapters";

import type {
  IConfigServer,
  IGenericConfigRepository,
  INestConfigRepository,
  ISpringConfigRepository,
} from "./interfaces/config-server.interface";
import type { IConfigServerRegistry } from "./interfaces/use-case-registry.interface";
import type { IHttpClient } from "./interfaces/http-client.interface";
import { genericConfigServerUseCase } from "./use-case/generic-config-server.use-case";

@Injectable()
export class ConfigClientService {
  private logger = new Logger(ConfigClientService.name);

  private readonly useCaseRegistry: IConfigServerRegistry = {
    "nest-config-server": nestConfigServerUseCase,
    "spring-config-server": springConfigServerUseCase,
    "generic-config-server": genericConfigServerUseCase,
  };

  get(key: string, configs: Record<string, any>): string {
    if (!configs || typeof configs !== "object") {
      return process.env[key] || "";
    }
    return configs[key] || process.env[key] || "";
  }

  static getConfig(key: string, configs: Record<string, any>): string {
    if (!configs || typeof configs !== "object") {
      return process.env[key] || "";
    }
    return configs[key] || process.env[key] || "";
  }

  private async processRepository(
    url: string,
    type: IConfigServer["type"],
    repository:
      | INestConfigRepository
      | ISpringConfigRepository
      | IGenericConfigRepository,
    httpClient: IHttpClient
  ) {
    const useCase = this.useCaseRegistry[type];
    return await useCase(url, repository as any, httpClient);
  }

  async getMultipleServers(servers: IConfigServer[]) {
    const allConfigs: Record<string, any> = {};

    for (const server of servers) {
      const {
        url,
        type,
        logging: enableLogging,
        alias,
        repositories,
        httpClient,
      } = server;

      const clientToUse = httpClient || DefaultHttpClient.create();

      for (const repository of repositories) {
        const { repo, application, profile } = repository as any;

        try {
          const response = await this.processRepository(
            url,
            type,
            repository,
            clientToUse
          );
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
              auth: repository["auth" as keyof typeof repository],
              httpClient: clientToUse.getName(),
            });
          }

          this.logger.log(
            `Configuration loaded ${application ?? ""} from ${url}`
          );
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
