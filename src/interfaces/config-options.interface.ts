import { type IConfigClient } from "./config-client.interface";
import { type IConfigRepository } from "./config-repository.interface";

export interface IConfigOptions {
  url: string;
  config: IConfigClient;
  options: IConfigRepository[];
}
