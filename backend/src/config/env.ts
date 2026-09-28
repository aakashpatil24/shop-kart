import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  clientUrl: string;
  nodeEnv: string;
}

const requiredVars = [
  "PORT",
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_EXPIRY",
  "CLIENT_URL",
] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    // Fail at import time so the server never boots half-configured.
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config: Config = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI as string,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY as string,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY as string,
  clientUrl: process.env.CLIENT_URL as string,
  nodeEnv: process.env.NODE_ENV ?? "development",
};
