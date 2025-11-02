# Nest Cloud Config Client

[English](./README.md) | [Español](#config-client)

Un cliente poderoso y flexible para cargar configuraciones desde múltiples Config Servers. Esta biblioteca está construida con TypeScript y proporciona una integración perfecta con aplicaciones NestJS, mientras también soporta aplicaciones Node.js y Express.

## Características

- 🔧 **Soporte Multi-Servidor**: Funciona con servidores de configuración personalizados y Spring Cloud Config Server
- 🌐 **Configuración Multi-Servidor**: Conecta a múltiples servidores de configuración simultáneamente
- 🏷️ **Soporte de Alias**: Agrega prefijos a las claves de configuración para evitar conflictos
- 🔒 **Autenticación**: Soporte integrado para autenticación básica
- 🌍 **Variables de Entorno**: Población automática de process.env
- 🎯 **Type-Safe**: Soporte completo de TypeScript con inferencia de tipos adecuada
- 🔄 **Compatibilidad de Versiones**: Manejo robusto de diferentes versiones de Spring Cloud Config
- 📦 **Framework Agnóstico**: Funciona con NestJS, Express, o Node.js plano

## Instalación

```bash
npm i @sorodriguez/nest-cloud-config-client
```

## Construido Con

- TypeScript
- Integración con NestJS
- Axios para peticiones HTTP

## Configuración del Cliente HTTP

Puedes personalizar el cliente HTTP usado para las peticiones. Por defecto, la biblioteca usa Axios, pero puedes especificar un cliente diferente.

**Nota**: Tanto `ConfigClientModule.forRoot()` como `ConfigClientModule.forRootAsync()` crean módulos globales automáticamente, por lo que no necesitas marcarlos como `@Global()` manualmente.

### Usando Axios (Por Defecto)

```typescript
import { ConfigClientModule } from "@sorodriguez/nest-cloud-client";

@Module({
  imports: [
    ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "spring-config-server",
        // httpClient no especificado - usa Axios por defecto
        repositories: [...]
      }
    ])
  ]
})
export class AppModule {}
```

### Usando Fetch

```typescript
import { ConfigClientModule, FetchHttpAdapter } from "@sorodriguez/nest-cloud-client";

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

### Usando Cliente HTTP Personalizado

```typescript
import { ConfigClientModule } from "@sorodriguez/nest-cloud-client";
import { IHttpClient, IHttpRequestOptions, IHttpResponse } from "@sorodriguez/nest-cloud-client";

class CustomHttpClient implements IHttpClient {
  async get<T>(url: string, options?: IHttpRequestOptions): Promise<IHttpResponse<T>> {
    // Tu implementación HTTP personalizada
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

## Configuración Asíncrona (forRootAsync)

Para carga de configuración dinámica, usa `forRootAsync` cuando necesites:

- Cargar configuración desde variables de entorno
- Usar ConfigService para configuración
- Realizar operaciones asíncronas antes de la inicialización del módulo
- Inyectar dependencias en la factory de configuración

**Nota**: `ConfigClientModule.forRootAsync()` crea un módulo global automáticamente, por lo que no necesitas marcarlo como `@Global()` manualmente.

### Creación de Configuración

Puedes crear la configuración de dos maneras:

#### Opción 1: Usando Funciones Helper (Recomendado)

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  ConfigClientModule,
  createSpringConfigServer, // 👈 Función helper
  createNestConfigServer, // 👈 Función helper
} from "@sorodriguez/nest-cloud-client";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConfigClientModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const servers = [
          // 👈 Sin 'as const' - el tipo se infiere automáticamente
          createSpringConfigServer({
            url: configService.get<string>(
              "CONFIG_SERVER_URL",
              "http://localhost:8888"
            ),
            logging: configService.get<boolean>("CONFIG_LOGGING", true),
            repositories: [
              {
                application: configService.get<string>(
                  "APPLICATION_NAME",
                  "my-app"
                ),
                profile: configService.get<string>("PROFILE", "development"),
              },
            ],
          }),
          createNestConfigServer({
            url: "http://localhost:8889",
            logging: true,
            alias: "nest",
            repositories: [
              {
                application: "stock-microservice",
                repo: "service-configuration-sb",
                profile: "prod",
                auth: {
                  username: "admin",
                  password: "admin",
                },
              },
            ],
          }),
        ];

        return servers;
      },
    }),
  ],
})
export class AppModule {}
```

#### Opción 2: Configuración Directa con `as const`

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigClientModule } from "@sorodriguez/nest-cloud-client";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConfigClientModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const servers = [
          // 👈 Necesitas 'as const' para type safety
          {
            url: configService.get<string>(
              "CONFIG_SERVER_URL",
              "http://localhost:8888"
            ),
            type: "spring-config-server" as const,
            logging: configService.get<boolean>("CONFIG_LOGGING", true),
            repositories: [
              {
                application: configService.get<string>(
                  "APPLICATION_NAME",
                  "my-app"
                ),
                profile: configService.get<string>("PROFILE", "development"),
              },
            ],
          },
        ];

        return servers;
      },
    }),
  ],
})
export class AppModule {}
```

### Configuración Asíncrona Avanzada con Múltiples Servidores

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  ConfigClientModule,
  AxiosHttpAdapter,
  FetchHttpAdapter,
} from "@sorodriguez/nest-cloud-client";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigClientModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // Cargar múltiples servidores desde el entorno
        const serverConfigs = configService.get<string>(
          "CONFIG_SERVERS",
          "primary,secondary"
        );
        const servers = serverConfigs.split(",").map((serverName) => {
          const url = configService.get<string>(
            `${serverName.toUpperCase()}_CONFIG_URL`
          );
          const type = configService.get<string>(
            `${serverName.toUpperCase()}_CONFIG_TYPE`,
            "spring-config-server"
          );

          if (!url) {
            throw new Error(
              `Falta configuración para el servidor: ${serverName}`
            );
          }

          return {
            url,
            type: type as "spring-config-server" | "nest-config-server",
            alias: serverName,
            logging: configService.get<string>("NODE_ENV") === "development",
            httpClient:
              configService.get<string>("HTTP_CLIENT") === "fetch"
                ? new FetchHttpAdapter()
                : new AxiosHttpAdapter(),
            repositories: [
              {
                application: configService.get<string>("APP_NAME", "my-app"),
                profile: configService.get<string>("NODE_ENV", "development"),
                repo:
                  type === "nest-config-server"
                    ? configService.get<string>("CONFIG_REPO")
                    : undefined,
                auth: configService.get<string>(
                  `${serverName.toUpperCase()}_USERNAME`
                )
                  ? {
                      username: configService.get<string>(
                        `${serverName.toUpperCase()}_USERNAME`
                      )!,
                      password: configService.get<string>(
                        `${serverName.toUpperCase()}_PASSWORD`
                      )!,
                    }
                  : undefined,
              },
            ],
          };
        });

        return servers;
      },
    }),
  ],
})
export class AppModule {}
```

### Variables de Entorno para Configuración Asíncrona

```bash
# .env
NODE_ENV=development
CONFIG_SERVER_URL=http://config-server:8888
APP_NAME=my-microservice
HTTP_CLIENT=axios

# Para múltiples servidores
CONFIG_SERVERS=primary,secondary
PRIMARY_CONFIG_URL=http://config-primary:8888
PRIMARY_CONFIG_TYPE=spring-config-server
SECONDARY_CONFIG_URL=http://config-secondary:3000
SECONDARY_CONFIG_TYPE=nest-config-server
CONFIG_REPO=my-config-repo

# Autenticación (opcional)
CONFIG_USERNAME=admin
CONFIG_PASSWORD=secret
PRIMARY_USERNAME=admin1
PRIMARY_PASSWORD=secret1
SECONDARY_USERNAME=admin2
SECONDARY_PASSWORD=secret2
```

## Tipos de Config Server

Esta biblioteca soporta tres tipos de servidores de configuración:

### 1. **nest-config-server**

Usa parámetros de consulta en la URL (ej. `?repo=...&application=...&profile=...`).
Diseñado para servidores de configuración personalizados de NestJS.

### 2. **spring-config-server**

Usa parámetros de ruta en la URL (ej. `/application/profile`).
Compatible con Spring Cloud Config Server (todas las versiones con manejo automático de fallback).

### 3. **generic-config-server**

Usa la URL tal como está sin modificaciones adicionales de parámetros o rutas.
Diseñado para cualquier endpoint HTTP genérico que retorne datos de configuración en formato JSON.
Perfecto para APIs REST, endpoints personalizados, o cualquier servicio HTTP que proporcione configuración.

## Uso

### Con NestJS

Importa el `ConfigClientModule` en el módulo raíz de tu aplicación:

```typescript
import { Module } from "@nestjs/common";
import { ConfigClientModule } from "@sorodriguez/nest-cloud-client";

@Module({
  imports: [
    ConfigClientModule.forRoot([
      {
        url: "http://localhost:8888",
        type: "nest-config-server",
        logging: true,
        alias: "nest", // Opcional: prefijo para las claves de configuración
        repositories: [
          {
            repo: "service-configuration", // REQUERIDO para nest-config-server
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
        alias: "spring", // Opcional: prefijo para las claves de configuración
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
      {
        url: "https://api.example.com/config", // URL directa al endpoint de configuración
        type: "generic-config-server",
        logging: true,
        alias: "api", // Opcional: prefijo para las claves de configuración
        config: {
          auth: {
            username: "api-user",
            password: "api-password",
          },
        },
      },
    ]),
  ],
})
export class AppModule {}
```

#### Inyectar y Usar Configuración

```typescript
import { Injectable, Inject } from "@nestjs/common";
import {
  CONFIG_CLIENT_VALUES,
  ConfigClientService,
} from "@sorodriguez/nest-cloud-client";

@Injectable()
export class AppService {
  constructor(
    @Inject(CONFIG_CLIENT_VALUES)
    private readonly config: Record<string, any>
  ) {}

  // Método 1: Acceso directo
  getDatabaseUrl(): string {
    return this.config["spring.datasource.url"] || "default-url";
  }

  // Método 2: Usando método helper estático (recomendado)
  getConfigValue(key: string): string {
    return ConfigClientService.getConfig(key, this.config);
  }

  // Ejemplos con alias
  getAliasedConfig(): any {
    return {
      // Si usaste alias "spring", las claves tendrán prefijo
      springDbUrl: this.getConfigValue("spring.datasource.url"),
      nestAppName: this.getConfigValue("nest.app.name"),
      // Sin alias, las claves permanecen como están
      directValue: this.getConfigValue("some.direct.property"),
    };
  }
}
```

### Con Express/Node.js

```javascript
const express = require("express");
const {
  ConfigClientModule,
  ConfigClientService,
} = require("@sorodriguez/nest-cloud-client");

const app = express();

async function bootstrap() {
  try {
    // Cargar configuración desde múltiples servidores
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

    // Invocar manualmente la carga de configuración
    const configProvider = configModule.providers.find(
      (p) => p.provide === "CONFIG_CLIENT_VALUES"
    );
    const config = await configProvider.useFactory();

    // La configuración ahora está disponible en process.env y el objeto config
    app.get("/config/:key", (req, res) => {
      const key = req.params.key;
      const value = ConfigClientService.getConfig(key, config);
      res.json({ key, value });
    });

    app.get("/", (req, res) => {
      res.json({
        message: "¡Configuración cargada exitosamente!",
        configKeys: Object.keys(config),
      });
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Servidor ejecutándose en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error al cargar la configuración:", error);
    process.exit(1);
  }
}

bootstrap();
```

### TypeScript (Sin NestJS)

```typescript
import {
  ConfigClientModule,
  ConfigClientService,
} from "@sorodriguez/nest-cloud-client";

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
          repo: undefined, // No necesario para Spring Config Server
        },
      ],
    },
  ]);

  const configProvider = configModule.providers.find(
    (p) => p.provide === "CONFIG_CLIENT_VALUES"
  );
  const config = await configProvider.useFactory();

  // Acceder a la configuración
  const dbUrl = ConfigClientService.getConfig("database.url", config);
  const apiKey = ConfigClientService.getConfig("api.key", config);

  console.log(`URL de Base de Datos: ${dbUrl}`);
  console.log(`API Key: ${apiKey}`);

  return config;
}

loadConfig().catch(console.error);
```

## Configuración Avanzada

### Múltiples Servidores con Alias

Usa alias para evitar conflictos de claves de configuración al conectar a múltiples servidores:

```typescript
ConfigClientModule.forRoot([
  {
    url: "http://localhost:8888",
    type: "nest-config-server",
    alias: "primary", // Las claves tendrán prefijo "primary."
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
    alias: "secondary", // Las claves tendrán prefijo "secondary."
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

Claves de configuración resultantes:

```
primary.database.url
primary.app.name
secondary.api.endpoint
secondary.cache.ttl
```

### Sin Alias (Comportamiento por Defecto)

```typescript
ConfigClientModule.forRoot([
  {
    url: "http://localhost:8888",
    type: "nest-config-server",
    // Sin alias - las claves permanecen sin cambios
    repositories: [...],
  },
])
```

Claves de configuración resultantes:

```
database.url
app.name
api.endpoint
```

### Múltiples Repositorios por Servidor

Cada servidor puede cargar desde múltiples repositorios:

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

### Ejemplos de Servidor de Configuración Genérica

El tipo `generic-config-server` te permite obtener configuración desde cualquier endpoint HTTP que retorne datos JSON:

#### Uso Básico

```typescript
{
  url: "https://api.miempresa.com/config",
  type: "generic-config-server",
  logging: true,
}
```

#### Con Autenticación

```typescript
{
  url: "https://api-segura.miempresa.com/config",
  type: "generic-config-server",
  logging: true,
  alias: "segura",
  config: {
    auth: {
      username: "usuario-config",
      password: "password-config"
    }
  }
}
```

#### Múltiples Endpoints Genéricos

```typescript
ConfigClientModule.forRoot([
  {
    url: "https://api.basedatos.com/config",
    type: "generic-config-server",
    alias: "bd",
    config: {
      auth: {
        username: "usuario-bd",
        password: "pass-bd",
      },
    },
  },
  {
    url: "https://api.cache.com/configuracion",
    type: "generic-config-server",
    alias: "cache",
  },
  {
    url: "https://api-interna.empresa.com/config-app",
    type: "generic-config-server",
    alias: "interna",
    config: {},
  },
]);
```

## Compatibilidad con Spring Cloud Config

Esta biblioteca maneja automáticamente diferentes versiones de Spring Cloud Config Server:

- **Primario**: `propertySources[].source` (estructura estándar)
- **Fallback 1**: Objeto `source` directo
- **Fallback 2**: Todas las propiedades excepto metadatos (`name`, `profiles`, `label`, `version`, `state`)

Esto asegura compatibilidad con:

- Spring Cloud Config 2.x
- Spring Cloud Config 3.x
- Implementaciones personalizadas
- Versiones legacy

## Manejo de Errores

La biblioteca incluye manejo robusto de errores:

- **Fallas de red**: Registradas y continúa con otros servidores
- **Errores de autenticación**: Mensajes de error detallados
- **Respuestas malformadas**: Parseo de fallback graceful
- **Configuraciones faltantes**: Fallback a variables de entorno

## Mejores Prácticas

1. **Usa alias** cuando te conectes a múltiples servidores para evitar conflictos de claves
2. **Usa el método estático `getConfig`** para mejor rendimiento y type safety
3. **Habilita logging** durante desarrollo para debuggear la carga de configuración
4. **Implementa fallbacks** en tu aplicación para valores de configuración críticos
5. **Usa perfiles específicos del entorno** (dev, test, prod)

## Licencia

ISC
