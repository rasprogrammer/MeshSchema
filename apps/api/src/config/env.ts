import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  apiPrefix: process.env.API_PREFIX ?? "/api/v1",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:4000/api/v1/auth/google/callback",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      callbackUrl: process.env.GITHUB_CALLBACK_URL ?? "http://localhost:4000/api/v1/auth/github/callback",
    },
  },
  isProd: (process.env.NODE_ENV ?? "development") === "production",
};
