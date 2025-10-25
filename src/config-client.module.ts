import { Module, Global, DynamicModule, Logger } from "@nestjs/common";

import { ConfigClientService } from "./config-client.service";

import type { IConfigRepository } from "./interfaces/config-repository.interface";
import type { IConfigClient } from "./interfaces/config-client.interface";

@Global()
@Module({})
export class ConfigClientModule {
  static forRoot(
    url: string,
    config: IConfigClient,
    options: IConfigRepository[]
  ): DynamicModule {
    const configProvider = {
      provide: "CONFIG_VALUES",
      useFactory: async () => {
        const configClient = new ConfigClientService({});
        return configClient.getRepositories({ url, config, options });
      },
    };

    return {
      module: ConfigClientModule,
      providers: [ConfigClientService, configProvider],
      exports: ["CONFIG_VALUES"],
    };
  }
}
