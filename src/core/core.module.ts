import { Global, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import configuration, { AppConfig } from '../config/configuration.js';
import { validateEnv } from '../config/env.validation.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor.js';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js';

/**
 * Infraestructura transversal registrada UNA sola vez.
 * Al registrarse como APP_* aplica a toda la app sin repetir nada en main.ts.
 * Orden de guards globales: JwtAuthGuard (autentica) → RolesGuard (autoriza).
 * JwtModule es global y se configura una sola vez aquí.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwt = config.getOrThrow<AppConfig['jwt']>('jwt');
        return {
          secret: jwt.secret,
          // JWT_EXPIRES_IN llega como string ("1h"); el tipo de @nestjs/jwt es más estricto.
          signOptions: {
            expiresIn: jwt.expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
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
