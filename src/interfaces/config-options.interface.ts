import { type IConfigRepository } from "./config-repository.interface";

export interface IConfigOptions {
  url: string;
  options: IConfigRepository[];
}
