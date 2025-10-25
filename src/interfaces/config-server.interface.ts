import type { IConfigRepository } from "./config-repository.interface";

export interface IConfigServer {
  url: string;
  type: "nest-config-server" | "spring-config-server";
  logging?: boolean;
  alias?: string;
  repositories: IConfigRepository[];
}
