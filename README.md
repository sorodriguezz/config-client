# Config Client

[English](#config-client) | [Español](./README.es.md)

A powerful and flexible client for loading configuration from multiple Config Servers. This library is built with TypeScript and provides seamless integration with NestJS applications, while also supporting plain Node.js and Express applications.

## Features

- 🔧 **Multiple Config Server Support**: Works with both custom config servers and Spring Cloud Config Server
- 🌐 **Multi-Server Configuration**: Connect to multiple config servers simultaneously
- 🏷️ **Alias Support**: Add prefixes to configuration keys to avoid conflicts
- 🔒 **Authentication**: Built-in support for basic authentication
- 🌍 **Environment Variables**: Automatic population of process.env
- 🎯 **Type-Safe**: Full TypeScript support with proper type inference
- 🔄 **Version Compatibility**: Robust handling of different Spring Cloud Config versions
- 📦 **Framework Agnostic**: Works with NestJS, Express, or plain Node.js

## Installation

```bash
npm i @sorodriguez/config-client
```

## Built With

- TypeScript
- NestJS integration
- Axios for HTTP requests

## HTTP Client Configuration

You can customize the HTTP client used for requests. By default, the library uses Axios, but you can specify a different client:

### Using Axios (Default)

```typescript
import { ConfigClientModule } from "@sorodriguez/config-client";

@Module({
  imports: [
    ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "spring-config-server",
        // httpClient not specified - uses Axios by default
        repositories: [...]
      }
    ])
  ]
})
export class AppModule {}
```

### Using Fetch

```typescript
import { ConfigClientModule, FetchHttpAdapter } from "@sorodriguez/config-client";

@Module({
  imports: [
    ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "spring-config-server",
        httpClient: new FetchHttpAdapter(),
        repositories: [...]
      }
    ])
  ]
})
export class AppModule {}
```

### Using Custom HTTP Client

```typescript
import { ConfigClientModule } from "@sorodriguez/config-client";
import { IHttpClient, IHttpRequestOptions, IHttpResponse } from "@sorodriguez/config-client";

class CustomHttpClient implements IHttpClient {
  async get<T>(url: string, options?: IHttpRequestOptions): Promise<IHttpResponse<T>> {
    // Your custom HTTP implementation
    const response = await yourHttpLibrary.get(url, options);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
  }

  getName(): string {
    return "custom";
  }
}

@Module({
  imports: [
    ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "spring-config-server",
        httpClient: new CustomHttpClient(),
        repositories: [...]
      }
    ])
  ]
})
export class AppModule {}
```

## Config Server Types

This library supports two types of config servers:

### 1. **nest-config-server**

Uses query parameters in the URL (e.g., `?repo=...&application=...&profile=...`).
Designed for custom NestJS config servers.

### 2. **spring-config-server**

Uses path parameters in the URL (e.g., `/application/profile`).
Compatible with Spring Cloud Config Server (all versions with automatic fallback handling).

## Usage

### With NestJS

Import the `ConfigClientModule` into your application's root module:

```typescript
import { Module } from "@nestjs/common";
import { ConfigClientModule } from "@sorodriguez/config-client";

@Module({
  imports: [
    ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "nest-config-server",
        logging: true,
        alias: "nest", // Optional: prefix for config keys
        repositories: [
          {
            repo: "service-configuration", // REQUIRED for nest-config-server
            application: "my-service",
            profile: "dev",
            auth: {
              username: "admin",
              password: "admin",
            },
          },
        ],
      },
      {
        url: "http://localhost:8889",
        type: "spring-config-server",
        logging: true,
        alias: "spring", // Optional: prefix for config keys
        repositories: [
          {
            application: "shared-config",
            profile: "prod",
            auth: {
              username: "admin",
              password: "admin",
            },
          },
        ],
      },
    ]),
  ],
})
export class AppModule {}
```

#### Inject and Use Configuration

```typescript
import { Injectable, Inject } from "@nestjs/common";
import {
  CONFIG_CLIENT_VALUES,
  ConfigClientService,
} from "@sorodriguez/config-client";

@Injectable()
export class AppService {
  constructor(
    @Inject(CONFIG_CLIENT_VALUES)
    private readonly config: Record<string, any>
  ) {}

  // Method 1: Direct access
  getDatabaseUrl(): string {
    return this.config["spring.datasource.url"] || "default-url";
  }

  // Method 2: Using static helper method (recommended)
  getConfigValue(key: string): string {
    return ConfigClientService.getConfig(key, this.config);
  }

  // Examples with aliases
  getAliasedConfig(): any {
    return {
      // If you used alias "spring", keys will be prefixed
      springDbUrl: this.getConfigValue("spring.datasource.url"),
      nestAppName: this.getConfigValue("nest.app.name"),
      // Without alias, keys remain as-is
      directValue: this.getConfigValue("some.direct.property"),
    };
  }
}
```

### With Express/Node.js

```javascript
const express = require("express");
const {
  ConfigClientModule,
  ConfigClientService,
} = require("@sorodriguez/config-client");

const app = express();

async function bootstrap() {
  try {
    // Load configuration from multiple servers
    const configModule = ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "nest-config-server",
        logging: true,
        repositories: [
          {
            repo: "my-config-repo",
            application: "my-app",
            profile: "dev",
            auth: {
              username: "admin",
              password: "admin",
            },
          },
        ],
      },
    ]);

    // Manually invoke the configuration loading
    const configProvider = configModule.providers.find(
      (p) => p.provide === "CONFIG_CLIENT_VALUES"
    );
    const config = await configProvider.useFactory();

    // Configuration is now available in process.env and config object
    app.get("/config/:key", (req, res) => {
      const key = req.params.key;
      const value = ConfigClientService.getConfig(key, config);
      res.json({ key, value });
    });

    app.get("/", (req, res) => {
      res.json({
        message: "Configuration loaded successfully!",
        configKeys: Object.keys(config),
      });
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

### TypeScript (Non-NestJS)

```typescript
import {
  ConfigClientModule,
  ConfigClientService,
} from "@sorodriguez/config-client";

async function loadConfig() {
  const configModule = ConfigClientModule.forRoot([
    {
      url: "https://your-config-server.com",
      type: "spring-config-server",
      logging: true,
      repositories: [
        {
          application: "my-application",
          profile: "production",
          repo: undefined, // Not needed for Spring Config Server
        },
      ],
    },
  ]);

  const configProvider = configModule.providers.find(
    (p) => p.provide === "CONFIG_CLIENT_VALUES"
  );
  const config = await configProvider.useFactory();

  // Access configuration
  const dbUrl = ConfigClientService.getConfig("database.url", config);
  const apiKey = ConfigClientService.getConfig("api.key", config);

  console.log(`Database URL: ${dbUrl}`);
  console.log(`API Key: ${apiKey}`);

  return config;
}

loadConfig().catch(console.error);
```

## Advanced Configuration

### Multiple Servers with Aliases

Use aliases to avoid configuration key conflicts when connecting to multiple servers:

```typescript
ConfigClientModule.forRoot([
  {
    url: "http://localhost:8888",
    type: "nest-config-server",
    alias: "primary", // Keys will be prefixed with "primary."
    repositories: [
      {
        repo: "main-config",
        application: "my-service",
        profile: "dev",
      },
    ],
  },
  {
    url: "http://localhost:8889",
    type: "spring-config-server",
    alias: "secondary", // Keys will be prefixed with "secondary."
    repositories: [
      {
        application: "shared-config",
        profile: "dev",
        repo: "",
      },
    ],
  },
]);
```

Result configuration keys:

```
primary.database.url
primary.app.name
secondary.api.endpoint
secondary.cache.ttl
```

### Without Aliases (Default Behavior)

```typescript
ConfigClientModule.forRoot([
  {
    url: "http://localhost:8888",
    type: "nest-config-server",
    // No alias - keys remain unchanged
    repositories: [...],
  },
])
```

Result configuration keys:

```
database.url
app.name
api.endpoint
```

### Multiple Repositories per Server

Each server can load from multiple repositories:

```typescript
{
  url: "http://localhost:8888",
  type: "nest-config-server",
  logging: true,
  repositories: [
    {
      repo: "database-config",
      application: "my-service",
      profile: "prod",
    },
    {
      repo: "cache-config",
      application: "my-service",
      profile: "prod",
    },
    {
      repo: "logging-config",
      application: "shared",
      profile: "prod",
    },
  ],
}
```

## Spring Cloud Config Compatibility

This library automatically handles different versions of Spring Cloud Config Server:

- **Primary**: `propertySources[].source` (standard structure)
- **Fallback 1**: Direct `source` object
- **Fallback 2**: All properties except metadata (`name`, `profiles`, `label`, `version`, `state`)

This ensures compatibility with:

- Spring Cloud Config 2.x
- Spring Cloud Config 3.x
- Custom implementations
- Legacy versions

## Error Handling

The library includes robust error handling:

- **Network failures**: Logged and continue with other servers
- **Authentication errors**: Detailed error messages
- **Malformed responses**: Graceful fallback parsing
- **Missing configurations**: Fallback to environment variables

## Best Practices

1. **Use aliases** when connecting to multiple servers to avoid key conflicts
2. **Use the static `getConfig` method** for better performance and type safety
3. **Enable logging** during development to debug configuration loading
4. **Implement fallbacks** in your application for critical configuration values
5. **Use environment-specific profiles** (dev, test, prod)

## License

ISC
