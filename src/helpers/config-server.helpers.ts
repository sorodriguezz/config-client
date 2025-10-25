import type {
  INestConfigServer,
  ISpringConfigServer,
} from "../interfaces/config-server.interface";

/**
 * Crea un servidor de configuración NestJS con tipo inferido automáticamente
 */
export function createNestConfigServer(
  config: Omit<INestConfigServer, "type">
): INestConfigServer {
  return {
    type: "nest-config-server",
    ...config,
  };
}

/**
 * Crea un servidor de configuración Spring Cloud con tipo inferido automáticamente
 */
export function createSpringConfigServer(
  config: Omit<ISpringConfigServer, "type">
): ISpringConfigServer {
  return {
    type: "spring-config-server",
    ...config,
  };
}
