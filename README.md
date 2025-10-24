# Config Client

[English](#config-client) | [Español](./README.es.md)

A lightweight client for loading configuration from a Config Server. This library is built with TypeScript and provides seamless integration with NestJS applications, but can also be used with plain Node.js and Express applications.

## Features

- Load configuration from a Config Server
- Support for multiple repositories, applications, and profiles
- Support for different config server types (default and Spring Config Server)
- Basic authentication support
- Automatic environment variable population
- Global module for NestJS applications

## Installation

```bash
npm i @sorodriguez/config-client
```

## Built With

- TypeScript
- NestJS integration
- Axios for HTTP requests

## Config Server Types

This library supports two types of config servers:

- **default**: Uses path parameters in the URL (e.g., `/application/profile`). Suitable for generic config servers.
- **spring-config-server**: Uses query parameters (e.g., `?repo=...&application=...&profile=...`). Designed for Spring Cloud Config Server compatibility.

## Usage

### With NestJS

Import the `ConfigClientModule` into your application's root module and use the `forRoot` method to configure it:

```typescript
import { Module } from "@nestjs/common";
import { ConfigClientModule } from "config-client";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigClientModule.forRoot("https://your-config-server-url/config", [
      {
        type: "default",
        application: "your-application-name",
        profile: "dev",
        auth: {
          username: "username",
          password: "password",
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

You can then inject the configuration values using the `@Inject` decorator:

```typescript
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(
    @Inject("CONFIG_VALUES") private readonly config: Record<string, any>
  ) {}

  getConfig(key: string): any {
    return this.config[key];
  }
}
```

### With TypeScript (non-NestJS)

You can use the module with plain TypeScript as well:

```typescript
import { ConfigClientModule } from "config-client";

async function loadConfig() {
  const configModule = ConfigClientModule.forRoot(
    "https://your-config-server-url/config",
    [
      {
        type: "default",
        application: "your-application-name",
        profile: "dev",
        auth: {
          username: "username",
          password: "password",
        },
      },
    ]
  );

  // Manually invoke the factory function
  const configProvider = configModule.providers.find(
    (p) => p.provide === "CONFIG_VALUES"
  );
  await configProvider.useFactory();

  // Now your configuration is loaded in process.env
  console.log(`Database URL: ${process.env.DATABASE_URL}`);
}

loadConfig().catch(console.error);
```

### With JavaScript (Node.js/Express)

```javascript
const { ConfigClientModule } = require("config-client");
const express = require("express");
const app = express();

async function bootstrap() {
  try {
    // Configure the config client
    const configModule = ConfigClientModule.forRoot(
      "https://your-config-server-url/config",
      [
        {
          type: "default",
          application: "your-application-name",
          profile: "dev",
          auth: {
            username: "username",
            password: "password",
          },
        },
      ]
    );

    // Manually invoke the factory function
    const configProvider = configModule.providers.find(
      (p) => p.provide === "CONFIG_VALUES"
    );
    await configProvider.useFactory();

    // Start your Express app
    app.get("/", (req, res) => {
      res.send("Configuration loaded successfully!");
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to load configuration:", error);
    process.exit(1);
  }
}

bootstrap();
```

## Multiple Connections

You can connect to multiple repositories, applications, or profiles by providing an array of configuration options:

```typescript
ConfigClientModule.forRoot("https://your-config-server-url/config", [
  // First configuration
  {
    type: "default",
    application: "api-service",
    profile: "dev",
    auth: {
      username: "username1",
      password: "password1",
    },
  },
  // Second configuration
  {
    type: "spring-config-server",
    repo: "shared-config-repo",
    application: "common",
    profile: "prod",
    auth: {
      username: "username2",
      password: "password2",
    },
  },
]);
```

This will load configuration from both sources and merge them into a single configuration object. If there are duplicate keys, the first one encountered will be used for environment variables.

## Connecting to Different Config Servers

If you need to connect to multiple config servers, you can create separate instances of the ConfigClientModule:

```typescript
import { Module } from "@nestjs/common";
import { ConfigClientModule } from "config-client";

@Module({
  imports: [
    // Primary config server
    ConfigClientModule.forRoot("https://primary-config-server/config", [
      {
        type: "default",
        application: "your-app",
        profile: "dev",
      },
    ]),
    // Secondary config server
    ConfigClientModule.forRoot("https://primary-config-server/config", [
      {
        type: "default",
        application: "your-app",
        profile: "prod",
      },
    ]),
  ],
})
export class AppModule {}
```

## API Reference

### ConfigClientModule

#### `forRoot(url: string, options: ConfigClientOptions[]): DynamicModule`

Creates and configures the ConfigClientModule.

- `url`: The URL of the Config Server
- `options`: An array of configuration options

### ConfigClientOptions

- `type`: The type of config server ('default' or 'spring-config-server')
- `repo`: The name of the repository (required for 'spring-config-server', optional for 'default')
- `application`: The name of the application
- `profile`: The profile to use (e.g., 'dev', 'prod')
- `auth`: (Optional) Authentication credentials
  - `username`: Username for basic authentication
  - `password`: Password for basic authentication

## License

ISC
