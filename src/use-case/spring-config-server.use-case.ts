import { type ISpringConfigRepository } from "../interfaces/config-server.interface";
import { type IHttpClient } from "../interfaces/http-client.interface";

export const springConfigServerUseCase = async (
  url: string,
  config: ISpringConfigRepository,
  httpClient: IHttpClient
) => {
  const { application, profile, auth } = config;

  const requestOptions = {
    auth: auth
      ? {
          username: auth.username,
          password: auth.password,
        }
      : undefined,
  };

  const requestUrl = `${url}/${application}/${profile}`;
  const response = await httpClient.get(requestUrl, requestOptions);

  const properties: Record<string, any> = {};

  if (response.data.propertySources) {
    response.data.propertySources.forEach((source: any) => {
      Object.assign(properties, source.source);
    });
  } else if (response.data.source) {
    Object.assign(properties, response.data.source);
  } else {
    const { name, profiles, label, version, state, ...rest } = response.data;
    Object.assign(properties, rest);
  }

  return { data: properties };
};
