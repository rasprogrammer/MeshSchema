import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.WS_PORT ?? process.env.PORT ?? 4001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
