import axios, { type AxiosRequestConfig } from "axios";
import { type IConfigRepository } from "../interfaces/config-repository.interface";

export const springConfigServerUseCase = async (
  url: string,
  config: IConfigRepository
) => {
  const { application, profile, auth } = config;

  const objAxios: AxiosRequestConfig = {
    url: `${url}/${application}/${profile}`,
  };

  if (auth) {
    objAxios.auth = {
      username: auth.username,
      password: auth.password,
    };
  }

  const response = await axios.get(objAxios.url!, objAxios);

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
