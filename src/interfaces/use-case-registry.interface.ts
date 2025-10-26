import type { IHttpClient } from "./http-client.interface";

export interface IConfigServerUseCase<T> {
  (url: string, config: T, httpClient: IHttpClient): Promise<{
    data: Record<string, any>;
  }>;
}

export interface IConfigServerRegistry {
  "nest-config-server": IConfigServerUseCase<
    import("./config-server.interface").INestConfigRepository
  >;
  "spring-config-server": IConfigServerUseCase<
    import("./config-server.interface").ISpringConfigRepository
  >;
  "generic-config-server": IConfigServerUseCase<
    import("./config-server.interface").IGenericConfigRepository
  >;
}
