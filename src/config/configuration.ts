/**
 * Configuración tipada de la aplicación.
 * Se consume con ConfigService: config.get('apiKeys'), config.get('database'), etc.
 */

/** "k1, k2,,k3" -> ['k1', 'k2', 'k3'] */
export const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiKeys: parseList(process.env.API_KEYS),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
});

export default configuration;
export type AppConfig = ReturnType<typeof configuration>;
