import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import {
  type IHttpClient,
  type IHttpRequestOptions,
  type IHttpResponse,
} from "../interfaces/http-client.interface";

export class AxiosHttpAdapter implements IHttpClient {
  async get<T = any>(
    url: string,
    options: IHttpRequestOptions = {}
  ): Promise<IHttpResponse<T>> {
    const { headers, params, auth, timeout } = options;

    const axiosConfig: AxiosRequestConfig = {
      url,
      method: "GET",
      headers,
      params,
      timeout,
    };

    if (auth) {
      axiosConfig.auth = {
        username: auth.username,
        password: auth.password,
      };
    }

    try {
      const response: AxiosResponse<T> = await axios.request(axiosConfig);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `HTTP ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error(
          "Network error - please check your internet connection"
        );
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  getName(): string {
    return "Axios";
  }
}
