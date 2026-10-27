import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_KEY_HEADER } from '../common/guards/api-key.guard.js';

export const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('FleetCore API')
    .setDescription(
      [
        'API REST para gestionar los mantenimientos de la flota de FleetCore.',
        '',
        '**Cómo probar:** pulsa **Authorize** e ingresa:',
        '- `bearer`: el token JWT que devuelve `POST /api/auth/login`.',
        `- \`${API_KEY_HEADER}\`: una de las claves de \`API_KEYS\` (solo endpoints de integración).`,
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: API_KEY_HEADER, in: 'header' },
      API_KEY_HEADER,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
