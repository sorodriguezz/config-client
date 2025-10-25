import axios, { type AxiosRequestConfig } from "axios";
import { type INestConfigRepository } from "../interfaces/config-server.interface";

export const nestConfigServerUseCase = async (
  url: string,
  config: INestConfigRepository
) => {
  const { repo, application, profile, auth } = config;

  const objAxios: AxiosRequestConfig = {
    params: {
      repo,
      application,
      profile,
    },
  };

  if (auth) {
    objAxios.auth = {
      username: auth.username,
      password: auth.password,
    };
  }
  return await axios.get(url, objAxios);
};
