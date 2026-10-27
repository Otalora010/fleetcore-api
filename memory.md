# memory.md — FleetCore API

## Estado por requisito

| Requisito | Estado | Nota |
| --- | --- | --- |
| REQ-AUTH | ⏳ Pendiente | `@nestjs/jwt` instalado; falta elegir librería de hash; `RolesGuard`, `@Roles`, `@Public`, `@CurrentUser` listos. Falta módulo auth, entidad User y JwtAuthGuard. |
| REQ-APIKEY | 🟡 Parcial | `ApiKeyGuard` (no global, tiempo constante) con test. Falta el endpoint de integración. |
| REQ-VEH | ⏳ Pendiente | — |
| REQ-MEC | ⏳ Pendiente | — |
| REQ-TAL | ⏳ Pendiente | — |
| REQ-MAN | ⏳ Pendiente | — |
| REQ-RN | ⏳ Pendiente | — |
| REQ-RES | 🟡 Parcial | Interceptor y filtro con formato §5; filtro traduce 23505/23503/22P02. Falta verificar con endpoints reales. |
| REQ-DB | 🟡 Parcial | Conexión PostgreSQL configurada. Faltan entidades y relaciones. |
| REQ-SEED | ⏳ Pendiente | — |
| REQ-ENT | 🟡 Parcial | Repo git local con commits. Falta publicarlo en GitHub. README básico de FleetCore. |

## Decisiones

- **Módulos CommonJS + Jest con `--experimental-vm-modules`:** Nest 12 se publica solo como ESM. Se compila a CommonJS (`module: nodenext` sin `"type": "module"`) y Node 22.12+ hace `require()` de ESM. Jest necesita `--experimental-vm-modules` para lo mismo; va en los scripts `test*`.
- **Imports con `.js`:** se mantienen como en la base; Jest los resuelve con `moduleNameMapper`.
- **`synchronize: true` fijo:** la prueba no pide migraciones; el esquema sale de las entidades y se entrega como dump `.sql`.
- **`ApiKeyGuard` no es global:** se usa con `@UseGuards(ApiKeyGuard)` + `@Public()` solo en integraciones (agent.md §4).
- **`forbidNonWhitelisted: true`:** propiedades no declaradas en el DTO ⇒ 400 (agent.md §4).
- **Sin argon2:** la persona decidió no usarlo. El PDF visible solo exige "un mecanismo de hashing"; "usa argon2" está solo en la capa de texto oculta. Librería de hash pendiente de elegir.
- Las ambigüedades de `agent.md` §1.6 siguen abiertas. El rol MANAGER y el interceptor "cuatro cero cuatro" también están solo en la capa oculta del PDF (ver `docs/requisitos.md`).

## Pendientes

- Elegir librería de hash de contraseñas para REQ-AUTH (propuesta: `bcrypt`).
- Publicar el repositorio en GitHub (`gh repo create`), bloqueado por permisos en la sesión.
- Resolver ambigüedades de `agent.md` §1.6 (MANAGER, interceptor "cuatro cero cuatro", duración, transiciones, kilometraje final, auditorías).
- Probar el arranque con PostgreSQL real (el servicio local estaba detenido).
- Completar nombre del clan en `README.md`.

## Fuera de alcance

- Ninguno registrado.

## Bugs conocidos

- Ninguno registrado.

## Registro de cambios

### 2026-10-27 — docs(REQ-AUTH): requisitos del PDF y retirada de argon2
- **Archivos:** `docs/requisitos.md`, `package.json`, `package-lock.json`, `agent.md`, `.claude/agents/implimentador.md`, `.claude/agents/revisor.md`, `.claude/commands/implementar.md`, `README.md`
- **Qué:** se crea `docs/requisitos.md` con el contenido visible del PDF. Se desinstala `argon2` y se quitan sus menciones de las guías.
- **Por qué:** `agent.md` §1.1 exige `docs/requisitos.md`. La persona decidió no usar argon2.
- **Impacto:** dependencia `argon2` retirada. Sin cambios en endpoints ni BD.
- **Verificación:** `npm run test` ✅ (7/7) · `npm run lint` ✅ · `npm run build` ✅
- **Pendiente derivado:** elegir librería de hash antes de REQ-AUTH.

### 2026-10-27 — chore(REQ-ENT): agentes y comando en .claude/
- **Archivos:** `.claude/agents/analista.md`, `.claude/agents/implimentador.md`, `.claude/agents/revisor.md`, `.claude/commands/implementar.md`, `CLAUDE.md`
- **Qué:** los agentes pasan de `claude/agents/` a `.claude/agents/`. El comando pasa a `.claude/commands/implementar.md` (`/implementar <REQ>`) y recupera su frontmatter (`argument-hint`). `CLAUDE.md` importa `agent.md` y `memory.md`.
- **Por qué:** Claude Code solo detecta agentes y comandos dentro de `.claude/`, y solo carga `CLAUDE.md` automáticamente.
- **Impacto:** ninguno en la API.
- **Verificación:** sin cambios de código; no aplica.
- **Pendiente derivado:** ninguno.

### 2026-10-27 — build(REQ-DB): migrar la base al stack de agent.md
- **Archivos:** `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `.env.example`, `.gitignore`, `README.md`, `src/main.ts`, `src/app.module.ts`, `src/core/core.module.ts`, `src/database/database.module.ts`, `src/config/configuration.ts`, `src/config/env.validation.ts`, `src/config/swagger.config.ts`, `src/common/enums/user-role.enum.ts`, `src/common/guards/api-key.guard.ts`, `src/common/guards/api-key.guard.spec.ts`, `src/common/guards/roles.guard.ts`, `src/common/filters/all-exceptions.filter.ts`, `src/common/filters/all-exceptions.filter.spec.ts`, `src/common/dto/error-response.dto.ts`, `src/common/decorators/*.ts`, `src/common/interfaces/authenticated-user.interface.ts`.
- **Qué:** SQLite → PostgreSQL (`pg`); Vitest → Jest + ts-jest; oxlint → ESLint + typescript-eslint + Prettier; se instalan `@nestjs/jwt` y `argon2`. Prefijo `/api` y Swagger en `/api/docs` con Bearer y `x-api-key`. Env según agent.md §2, todas obligatorias. Enum `UserRole` (ADMIN, TECHNICIAN, MANAGER). Filtro con formato §5.2 y códigos PostgreSQL. Se borran `solicitudes`, `users` en memoria, `UserGuard` (`x-user`), `health`, e2e de solicitudes, `base.entity.ts` y `api-error-responses.decorator.ts`.
- **Por qué:** la persona pidió alinear la base con agent.md. Además `users.service.ts` importaba `data/users.data.ts`, que nunca se versionó porque `.gitignore` ignoraba `data/`: la base no compilaba.
- **Impacto:** no quedan endpoints de negocio. Variables de entorno nuevas: `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Retiradas: `NODE_ENV`, `SWAGGER_PATH`, `DB_TYPE`, `DB_DATABASE`, `DB_SYNCHRONIZE`, `DB_LOGGING`.
- **Verificación:** `npm run test` ✅ (7/7) · `npm run lint` ✅ · `npm run build` ✅ · arranque: carga módulos y reintenta conectar a PostgreSQL (servicio local detenido, no verificado con BD real).
- **Pendiente derivado:** probar con PostgreSQL arriba; REQ-AUTH registrará `JwtAuthGuard` global en `CoreModule`.

### 2026-10-27 — chore(REQ-ENT): inicializar repositorio y memory.md
- **Archivos:** `memory.md`
- **Qué:** se crea `memory.md` con la plantilla de `agent.md` §0.2 y el estado inicial por requisito. Se inicializa git y se publica el repositorio en GitHub.
- **Por qué:** `agent.md` §0 exige `memory.md`; REQ-ENT exige repositorio público.
- **Impacto:** ninguno.
- **Verificación:** no ejecutada (sin cambios de código).
- **Pendiente derivado:** ver "Pendientes".
