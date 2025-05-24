# Config Client

[English](./README.md) | [Español](#config-client)

Un cliente ligero para cargar configuraciones desde un Config Server. Esta biblioteca está construida con TypeScript y proporciona una integración perfecta con aplicaciones NestJS, pero también puede utilizarse con aplicaciones Node.js y Express.

## Características

- Carga de configuraciones desde un Config Server
- Soporte para múltiples repositorios, aplicaciones y perfiles
- Soporte para autenticación básica
- Población automática de variables de entorno
- Módulo global para aplicaciones NestJS

## Instalación

```bash
npm install config-client
```

## Construido Con

- TypeScript
- Integración con NestJS
- Axios para peticiones HTTP

## Uso

### Con NestJS

Importa el módulo `ConfigClientModule` en el módulo raíz de tu aplicación y utiliza el método `forRoot` para configurarlo:

```typescript
import { Module } from '@nestjs/common';
import { ConfigClientModule } from 'config-client';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigClientModule.forRoot('https://tu-config-server-url/config', [
      {
        repo: 'tu-repositorio-config',
        application: 'nombre-de-tu-aplicacion',
        profile: 'dev',
        auth: {
          username: 'usuario',
          password: 'contraseña'
        }
      }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Puedes inyectar los valores de configuración utilizando el decorador `@Inject`:

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@Inject('CONFIG_VALUES') private readonly config: Record<string, any>) {}

  getConfig(key: string): any {
    return this.config[key];
  }
}
```

### Con TypeScript (sin NestJS)

También puedes utilizar el módulo con TypeScript puro:

```typescript
import { ConfigClientModule } from 'config-client';

async function cargarConfig() {
  const configModule = ConfigClientModule.forRoot('https://tu-config-server-url/config', [
    {
      repo: 'tu-repositorio-config',
      application: 'nombre-de-tu-aplicacion',
      profile: 'dev',
      auth: {
        username: 'usuario',
        password: 'contraseña'
      }
    }
  ]);

  // Invocar manualmente la función factory
  const configProvider = configModule.providers.find(p => p.provide === 'CONFIG_VALUES');
  await configProvider.useFactory();

  // Ahora tu configuración está cargada en process.env
  console.log(`URL de la base de datos: ${process.env.DATABASE_URL}`);
}

cargarConfig().catch(console.error);
```

### Con JavaScript (Node.js/Express)

```javascript
const { ConfigClientModule } = require('config-client');
const express = require('express');
const app = express();

async function bootstrap() {
  try {
    // Configurar el cliente de configuración
    const configModule = ConfigClientModule.forRoot('https://tu-config-server-url/config', [
      {
        repo: 'tu-repositorio-config',
        application: 'nombre-de-tu-aplicacion',
        profile: 'dev',
        auth: {
          username: 'usuario',
          password: 'contraseña'
        }
      }
    ]);

    // Invocar manualmente la función factory
    const configProvider = configModule.providers.find(p => p.provide === 'CONFIG_VALUES');
    await configProvider.useFactory();

    // Iniciar tu aplicación Express
    app.get('/', (req, res) => {
      res.send('¡Configuración cargada exitosamente!');
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Servidor ejecutándose en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al cargar la configuración:', error);
    process.exit(1);
  }
}

bootstrap();
```

## Múltiples Conexiones

Puedes conectarte a múltiples repositorios, aplicaciones o perfiles proporcionando un array de opciones de configuración:

```typescript
ConfigClientModule.forRoot('https://tu-config-server-url/config', [
  // Primera configuración
  {
    repo: 'repositorio-config-principal',
    application: 'servicio-api',
    profile: 'dev',
    auth: {
      username: 'usuario1',
      password: 'contraseña1'
    }
  },
  // Segunda configuración
  {
    repo: 'repositorio-config-compartido',
    application: 'comun',
    profile: 'prod',
    auth: {
      username: 'usuario2',
      password: 'contraseña2'
    }
  }
])
```

Esto cargará la configuración de ambas fuentes y las fusionará en un solo objeto de configuración. Si hay claves duplicadas, la primera encontrada se utilizará para las variables de entorno.

## Conexión a Diferentes Config Servers

Si necesitas conectarte a varios Config Servers, puedes crear instancias separadas del ConfigClientModule:

```typescript
import { Module } from '@nestjs/common';
import { ConfigClientModule } from 'config-client';

@Module({
  imports: [
    // Config server primario
    ConfigClientModule.forRoot('https://config-server-primario/config', [
      {
        repo: 'repo-primario',
        application: 'tu-app',
        profile: 'dev'
      }
    ]),
    // Config server secundario
    ConfigClientModule.forRoot('https://primary-config-server/config', [
      {
        repo: 'primary-repo',
        application: 'your-app',
        profile: 'prod'
      }
    ]),
  ],
})
export class AppModule {}
```

## Referencia de la API

### ConfigClientModule

#### `forRoot(url: string, options: ConfigClientOptions[]): DynamicModule`

Crea y configura el ConfigClientModule.

- `url`: La URL del Config Server
- `options`: Un array de opciones de configuración

### ConfigClientOptions

- `repo`: El nombre del repositorio
- `application`: El nombre de la aplicación
- `profile`: El perfil a utilizar (ej. 'dev', 'prod')
- `auth`: (Opcional) Credenciales de autenticación
  - `username`: Nombre de usuario para autenticación básica
  - `password`: Contraseña para autenticación básica

## Licencia

ISC
