import { Global, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import configuration from '../config/configuration.js';
import { validateEnv } from '../config/env.validation.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor.js';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js';

/**
 * Infraestructura transversal registrada UNA sola vez.
 * Al registrarse como APP_* aplica a toda la app sin repetir nada en main.ts.
 * El JwtAuthGuard global se registrará aquí, antes de RolesGuard (REQ-AUTH).
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // Rechaza con 400 cualquier propiedad que no esté en el DTO (id, estado, rol...),
        // así el cliente nunca puede modificar campos protegidos.
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true, // convierte payloads a instancias de DTO y params a su tipo
      }),
    },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class CoreModule {}
