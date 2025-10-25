import { type INestConfigRepository } from "../interfaces/config-server.interface";
import { type IHttpClient } from "../interfaces/http-client.interface";

export const nestConfigServerUseCase = async (
  url: string,
  config: INestConfigRepository,
  httpClient: IHttpClient
) => {
  const { repo, application, profile, auth } = config;

  const requestOptions = {
    params: {
      repo,
      application,
      profile,
    },
    auth: auth
      ? {
          username: auth.username,
          password: auth.password,
        }
      : undefined,
  };

  return await httpClient.get(url, requestOptions);
};
