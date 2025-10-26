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
  application: string;
  profile: string;
}

interface ISpringConfigRepository extends IConfigRepository {
  application: string;
  profile: string;
}

interface IGenericConfigRepository extends IConfigRepository {}

export interface INestConfigServer extends IBaseConfigServer {
  type: "nest-config-server";
  repositories: INestConfigRepository[];
}

export interface ISpringConfigServer extends IBaseConfigServer {
  type: "spring-config-server";
  repositories: ISpringConfigRepository[];
}

export interface IGenericConfigServer extends IBaseConfigServer {
  type: "generic-config-server";
  config: IConfigRepository;
}

export type IConfigServer =
  | INestConfigServer
  | ISpringConfigServer
  | IGenericConfigServer;

export type {
  INestConfigRepository,
  ISpringConfigRepository,
  IGenericConfigRepository,
};
