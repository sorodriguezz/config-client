import {
  Module,
  Global,
  DynamicModule,
  InjectionToken,
  Provider,
} from "@nestjs/common";

import { ConfigClientService } from "./config-client.service";

import type { IConfigServer } from "./interfaces/config-server.interface";
import { ConfigClientModuleAsyncOptions } from "./interfaces/config-client-module-async.interface";

export const CONFIG_CLIENT_VALUES: InjectionToken<Record<string, any>> =
  "CONFIG_CLIENT_VALUES";

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

  static forRootAsync(options: ConfigClientModuleAsyncOptions): DynamicModule {
    const configProvider: Provider = {
      provide: CONFIG_CLIENT_VALUES,
      useFactory: async (...args: any[]) => {
        const servers = await options.useFactory!(...args);
        const configClient = new ConfigClientService();
        return configClient.getMultipleServers(servers);
      },
      inject: options.inject || [],
    };

    return {
      module: ConfigClientModule,
      providers: [ConfigClientService, configProvider],
      exports: [CONFIG_CLIENT_VALUES],
    };
  }
}
