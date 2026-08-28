import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3002),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
