import "dotenv/config";

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret-before-production",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  database: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "cosmetics_store",
  },
};
