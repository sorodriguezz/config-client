import { IConfigServer } from "./config-server.interface";

export interface ConfigClientModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<IConfigServer[]> | IConfigServer[];
  inject?: any[];
  useClass?: any;
  useExisting?: any;
}
