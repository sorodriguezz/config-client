export interface IConfigClient {
  type: "nest-config-server" | "spring-config-server";
  logging?: boolean;
}
