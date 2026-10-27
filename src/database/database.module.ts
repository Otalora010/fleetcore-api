import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration.js';

/**
 * Conexión TypeORM a PostgreSQL.
 * autoLoadEntities: toda entidad registrada con TypeOrmModule.forFeature([...]) en
 * cualquier módulo se carga sola; no hay que listar rutas ni globs.
 * synchronize: la prueba no exige migraciones; el esquema se genera desde las
 * entidades y se entrega como dump .sql.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<AppConfig['database']>('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
