import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MechanicsModule } from './modules/mechanics/mechanics.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';

/**
 * Módulo raíz: solo compone módulos.
 * - CoreModule: config, guards, pipe, interceptor y filtro globales.
 * - DatabaseModule: conexión TypeORM a PostgreSQL.
 * - modules/*: un módulo por recurso de negocio (agrega los nuevos aquí).
 */
@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    VehiclesModule,
    MechanicsModule,
  ],
})
export class AppModule {}
