import type { IConfigRepository } from "./config-repository.interface";
import type { IHttpClient } from "./http-client.interface";

interface IBaseConfigServer {
  url: string;
  logging?: boolean;
  alias?: string;
  httpClient?: IHttpClient;
}

interface INestConfigRepository extends IConfigRepository {
  repo: string;
}

interface ISpringConfigRepository extends IConfigRepository {}

export interface INestConfigServer extends IBaseConfigServer {
  type: "nest-config-server";
  repositories: INestConfigRepository[];
}

export interface ISpringConfigServer extends IBaseConfigServer {
  type: "spring-config-server";
  repositories: ISpringConfigRepository[];
}

export type IConfigServer = INestConfigServer | ISpringConfigServer;

export type { INestConfigRepository, ISpringConfigRepository };
