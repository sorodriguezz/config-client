export interface IConfigServerUseCase<T> {
  (url: string, config: T): Promise<{ data: Record<string, any> }>;
}

export interface IConfigServerRegistry {
  "nest-config-server": IConfigServerUseCase<
    import("./config-server.interface").INestConfigRepository
  >;
  "spring-config-server": IConfigServerUseCase<
    import("./config-server.interface").ISpringConfigRepository
  >;
}
