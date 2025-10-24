import { Module, Global, DynamicModule, Logger } from "@nestjs/common";
import { ConfigClientService } from "./config-client.service";
import { type IConfigRepository } from "./interfaces/config-repository.interface";

@Global()
@Module({})
export class ConfigClientModule {
  static forRoot(url: string, options: IConfigRepository[]): DynamicModule {
    const configProvider = {
      provide: "CONFIG_VALUES",
      useFactory: async () => {
        const configClient = new ConfigClientService({});
        return configClient.getRepositories({ url, options });
      },
    };

    return {
      module: ConfigClientModule,
      providers: [ConfigClientService, configProvider],
      exports: ["CONFIG_VALUES"],
    };
  }
}
