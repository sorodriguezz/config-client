export interface IHttpAuth {
  username: string;
  password: string;
}

export interface IHttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  auth?: IHttpAuth;
  timeout?: number;
}

export interface IHttpResponse<T = any> {
  data: T;
  status?: number;
  statusText?: string;
}

export interface IHttpClient {
  get<T = any>(
    url: string,
    options?: IHttpRequestOptions
  ): Promise<IHttpResponse<T>>;

  getName(): string;
}
