import { IGenericConfigRepository } from "../interfaces/config-server.interface";
import { IHttpClient } from "../interfaces/http-client.interface";

export const genericConfigServerUseCase = async (
  url: string,
  config: IGenericConfigRepository,
  httpClient: IHttpClient
) => {
  const requestOptions = {
    auth: config.auth
      ? {
          username: config.auth.username,
          password: config.auth.password,
        }
      : undefined,
  };

  return await httpClient.get(url, requestOptions);
};
