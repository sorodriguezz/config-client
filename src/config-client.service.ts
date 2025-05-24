import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ConfigClientService {
  constructor(
    @Inject("CONFIG_VALUES") private config: Record<string, string>
  ) {}

  get(key: string): string {
    return this.config[key] || process.env[key] || "";
  }
}
