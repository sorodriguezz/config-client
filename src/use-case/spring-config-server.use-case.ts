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

  return await axios.get(objAxios.url!, objAxios);
};
