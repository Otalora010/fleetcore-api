import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module.js';
import { DatabaseModule } from './database/database.module.js';

/**
 * Módulo raíz: solo compone módulos.
 * - CoreModule: config, guards, pipe, interceptor y filtro globales.
 * - DatabaseModule: conexión TypeORM a PostgreSQL.
 * - modules/*: un módulo por recurso de negocio (agrega los nuevos aquí).
 */
@Module({
  imports: [CoreModule, DatabaseModule],
})
export class AppModule {}
