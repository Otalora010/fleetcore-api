# FleetCore API

API REST para gestionar el ciclo de vida de los mantenimientos (preventivos y correctivos) de la flota de FleetCore: vehículos, mecánicos, talleres y mantenimientos, con autenticación JWT y roles.

> Prueba de desempeño – Módulo 6.2 NestJS.
> **Coder:** Santiago Otalora · **Clan:** Ruta Node/Nest

## Stack

NestJS 12 · TypeScript · TypeORM · PostgreSQL · JWT (`@nestjs/jwt`) · class-validator · Swagger · Jest · ESLint + Prettier

## Requisitos

- Node.js 22.12+ (probado en 24.15)
- PostgreSQL 14+

## Inicio rápido

```bash
npm install
cp .env.example .env          # ajusta las credenciales de PostgreSQL
createdb fleetcore            # o crea la base desde psql
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

Si falta una variable obligatoria del `.env`, la app no arranca y muestra cuál.

## Comandos

| Comando              | Qué hace               |
| -------------------- | ---------------------- |
| `npm run start:dev`  | Desarrollo con recarga |
| `npm run build`      | Compila a `dist/`      |
| `npm run start:prod` | Ejecuta `dist/main.js` |
| `npm run test`       | Tests unitarios (Jest) |
| `npm run test:cov`   | Tests con cobertura    |
| `npm run lint`       | ESLint                 |
| `npm run format`     | Prettier               |

## Variables de entorno

Ver [`.env.example`](.env.example): `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `API_KEYS`.

## Formato de respuestas

Éxito:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

Error:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "El vehículo ABC123 ya tiene un mantenimiento activo",
  "path": "/api/maintenances",
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

## Pendiente de documentar

Credenciales de prueba del seeder, endpoints, reglas de negocio, dump `.sql` y evidencias. Se completan a medida que se implementa cada requisito (ver `memory.md`).

## Autenticación

- `POST /api/auth/register` (público): crea un usuario con rol `ADMIN` o `TECHNICIAN`. Contraseña mínima de 8 caracteres.
- `POST /api/auth/login` (público): devuelve `{ accessToken, user }`.
- `GET /api/auth/me`: datos del usuario autenticado (requiere Bearer).
- En Swagger (`/api/docs`) usa el botón **Authorize** y pega el `accessToken` (sin el prefijo `Bearer`).
- Riesgo conocido: como el enunciado lo exige literalmente, el registro público permite crear usuarios `ADMIN`, es decir, cualquiera puede escalar privilegios. Aceptado para la prueba; en producción se restringiría.

## Vehículos

Lectura para cualquier usuario autenticado; escritura solo `ADMIN`.

- `GET /api/vehicles`: lista.
- `GET /api/vehicles/:id` y `GET /api/vehicles/plate/:plate`: detalle.
- `POST /api/vehicles` (ADMIN): crea (estado inicial `AVAILABLE`).
- `PATCH /api/vehicles/:id` (ADMIN): actualiza datos (no el estado; el kilometraje no puede bajar).
- `PATCH /api/vehicles/:id/deactivate` (ADMIN): inactivación lógica.

## Mecánicos

Lectura para cualquier usuario autenticado; escritura solo `ADMIN`.

- `GET /api/mechanics` y `GET /api/mechanics/:id`: lista y detalle.
- `POST /api/mechanics` (ADMIN): crea (estado inicial `ACTIVE`; `userId` opcional de un usuario `TECHNICIAN`).
- `PATCH /api/mechanics/:id` (ADMIN): actualiza datos y/o vínculo `userId`.
- `PATCH /api/mechanics/:id/activate` y `/deactivate` (ADMIN): activar e inactivar (lógico).

## Talleres

Lectura para cualquier usuario autenticado; escritura solo `ADMIN`. El listado muestra solo los activos.

- `GET /api/workshops`: lista de talleres activos.
- `GET /api/workshops/:id`: detalle (aunque esté inactivo).
- `POST /api/workshops` (ADMIN): crea (estado inicial `ACTIVE`; nombre único).
- `PATCH /api/workshops/:id/activate` y `/deactivate` (ADMIN): activar e inactivar (lógico, sin borrar historial).
