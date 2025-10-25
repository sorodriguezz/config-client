import { Module, Global, DynamicModule, Logger } from "@nestjs/common";

import { ConfigClientService } from "./config-client.service";

import type { IConfigServer } from "./interfaces/config-server.interface";

export const CONFIG_CLIENT_VALUES = Symbol("CONFIG_CLIENT_VALUES");

@Global()
@Module({})
export class ConfigClientModule {
  static forRoot(servers: IConfigServer[]): DynamicModule {
    const configProvider = {
      provide: CONFIG_CLIENT_VALUES,
      useFactory: async () => {
        const configClient = new ConfigClientService();
        return configClient.getMultipleServers(servers);
      },
    };

    return {
      module: ConfigClientModule,
      providers: [ConfigClientService, configProvider],
      exports: [CONFIG_CLIENT_VALUES],
    };
  }
}
