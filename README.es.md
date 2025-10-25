# Config Client

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
npm i @sorodriguez/config-client
```

## Construido Con

- TypeScript
- Integración con NestJS
- Axios para peticiones HTTP

## Configuración del Cliente HTTP

Puedes personalizar el cliente HTTP usado para las peticiones. Por defecto, la biblioteca usa Axios, pero puedes especificar un cliente diferente:

### Usando Axios (Por Defecto)

```typescript
import { ConfigClientModule } from "@sorodriguez/config-client";

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

### Usando Cliente HTTP Personalizado

```typescript
import { ConfigClientModule } from "@sorodriguez/config-client";
import { IHttpClient, IHttpRequestOptions, IHttpResponse } from "@sorodriguez/config-client";

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

## Tipos de Config Server

Esta biblioteca soporta dos tipos de servidores de configuración:

### 1. **nest-config-server**

Usa parámetros de consulta en la URL (ej. `?repo=...&application=...&profile=...`).
Diseñado para servidores de configuración personalizados de NestJS.

### 2. **spring-config-server**

Usa parámetros de ruta en la URL (ej. `/application/profile`).
Compatible con Spring Cloud Config Server (todas las versiones con manejo automático de fallback).

## Uso

### Con NestJS

Importa el `ConfigClientModule` en el módulo raíz de tu aplicación:

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
} from "@sorodriguez/config-client";

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
} = require("@sorodriguez/config-client");

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
