import {
  type IHttpClient,
  type IHttpRequestOptions,
  type IHttpResponse,
} from "../interfaces/http-client.interface";

export class FetchHttpAdapter implements IHttpClient {
  async get<T = any>(
    url: string,
    options: IHttpRequestOptions = {}
  ): Promise<IHttpResponse<T>> {
    const { headers, params, auth, timeout = 30000 } = options;

    const requestUrl = this.buildUrl(url, params);
    const requestHeaders = this.buildHeaders(headers, auth);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      if (error instanceof TypeError) {
        throw new Error(
          "Network error - please check your internet connection"
        );
      }

      throw error;
    }
  }

  private buildUrl(
    baseUrl: string,
    params?: Record<string, string | number | boolean>
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    return url.toString();
  }

  private buildHeaders(
    headers?: Record<string, string>,
    auth?: IHttpRequestOptions["auth"]
  ): Record<string, string> {
    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    };

    if (auth) {
      const credentials = btoa(`${auth.username}:${auth.password}`);
      finalHeaders.Authorization = `Basic ${credentials}`;
    }

    return finalHeaders;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    try {
      const text = await response.text();
      return JSON.parse(text);
    } catch {
      return response as unknown as T;
    }
  }

  getName(): string {
    return "fetch";
  }
}
