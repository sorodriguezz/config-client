import { Module, Global, DynamicModule, Logger } from "@nestjs/common";
import axios, { AxiosRequestConfig } from "axios";
import { ConfigClientOptions } from "./config-client-options.interface";

@Global()
@Module({})
export class ConfigClientModule {
  static logger = new Logger(ConfigClientModule.name);

  static forRoot(url: string, options: ConfigClientOptions[]): DynamicModule {
    const configProvider = {
      provide: "CONFIG_VALUES",
      useFactory: async () => {
        const allConfigs: Record<string, any> = {};

        for (const option of options) {
          const { repo, application, profile, auth } = option;

          const objAxios: AxiosRequestConfig = {
            params: {
              repo,
              application,
              profile,
            },
          };

          if (auth) {
            objAxios.auth = {
              username: auth.username,
              password: auth.password,
            };
          }

          try {
            const response = await axios.get(url, objAxios);
            const config = response.data;

            Object.entries(config).forEach(([key, value]) => {
              if (!process.env[key]) {
                process.env[key] = String(value);
              }
              allConfigs[key] = value;
            });
            this.logger.log(
              `✅ Configuration loaded from Config Server: ${url}`
            );
            this.logger.log(`🗄️ Repository: ${repo}`);
            this.logger.log(`📦 Application: ${application}`);
            this.logger.log(`🗒️ Profile: ${profile}`);
          } catch (err: any) {
            this.logger.error(
              "Error cargando configuración remota:",
              err.message
            );
            throw err;
          }
        }
      },
    };

    return {
      module: ConfigClientModule,
      providers: [configProvider],
      exports: ["CONFIG_VALUES"],
    };
  }
}
