# memory.md — FleetCore API

## Estado por requisito

| Requisito | Estado | Nota |
| --- | --- | --- |
| REQ-AUTH | ⏳ Pendiente | La base usa `x-user` + `UserGuard`; falta JWT + argon2. |
| REQ-APIKEY | 🟡 Parcial | Existe `src/common/guards/api-key.guard.ts`; falta el endpoint de integración. |
| REQ-VEH | ⏳ Pendiente | — |
| REQ-MEC | ⏳ Pendiente | — |
| REQ-TAL | ⏳ Pendiente | — |
| REQ-MAN | ⏳ Pendiente | La base trae un módulo `solicitudes` ajeno a FleetCore. |
| REQ-RN | ⏳ Pendiente | — |
| REQ-RES | 🟡 Parcial | Existen `response.interceptor.ts` y `all-exceptions.filter.ts`; revisar contra §5. |
| REQ-DB | ⏳ Pendiente | La base usa SQLite (`better-sqlite3`); se exige PostgreSQL. |
| REQ-SEED | ⏳ Pendiente | — |
| REQ-ENT | 🟡 Parcial | Repositorio creado. README aún describe la base de solicitudes. |

## Decisiones

- Ninguna registrada todavía. Las ambigüedades de `agent.md` §1.6 siguen abiertas.

## Pendientes

- Falta `docs/requisitos.md` (transcripción del PDF), citada como fuente de verdad en `agent.md` §1.1.
- Stack de la base distinto al de `agent.md` §2: Vitest (no Jest), oxlint (no ESLint), SQLite (no PostgreSQL), sin `@nestjs/jwt` ni `argon2`. Decidir con la persona.
- Resolver ambigüedades de `agent.md` §1.6 (MANAGER, interceptor "cuatro cero cuatro", duración, transiciones, kilometraje final, auditorías).
- Retirar el módulo `solicitudes` y `UserGuard` (`x-user`) cuando se implemente FleetCore.

## Fuera de alcance

- Ninguno registrado.

## Bugs conocidos

- Ninguno registrado.

## Registro de cambios

### 2026-10-27 — chore(REQ-ENT): inicializar repositorio y memory.md
- **Archivos:** `memory.md`
- **Qué:** se crea `memory.md` con la plantilla de `agent.md` §0.2 y el estado inicial por requisito. Se inicializa git y se publica el repositorio en GitHub.
- **Por qué:** `agent.md` §0 exige `memory.md`; REQ-ENT exige repositorio público.
- **Impacto:** ninguno.
- **Verificación:** no ejecutada (sin cambios de código).
- **Pendiente derivado:** ver "Pendientes".
