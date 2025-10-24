import axios, { type AxiosRequestConfig } from "axios";
import { type IConfigRepository } from "../interfaces/config-repository.interface";

export const defaultUseCase = async (
  url: string,
  config: IConfigRepository
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
