import { AxiosHttpAdapter } from "./axios-http.adapter";
import { FetchHttpAdapter } from "./fetch-http.adapter";
import { type IHttpClient } from "../interfaces/http-client.interface";

export class DefaultHttpClient {
  static create(): IHttpClient {
    return new AxiosHttpAdapter();
  }

  static createAxios(): IHttpClient {
    return new AxiosHttpAdapter();
  }

  static createFetch(): IHttpClient {
    return new FetchHttpAdapter();
  }
}

export { AxiosHttpAdapter } from "./axios-http.adapter";
export { FetchHttpAdapter } from "./fetch-http.adapter";
