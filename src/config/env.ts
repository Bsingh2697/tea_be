import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import jwt from "jsonwebtoken";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required().description("MongoDB connection string"),
  JWT_SECRET: Joi.string().required().description("JWT secret key"),
  JWT_EXPIRE: Joi.string().default("7d"),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRE: Joi.string().default("30d"),
  BCRYPT_ROUNDS: Joi.number().default(10),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  CORS_ORIGIN: Joi.string().default("*"),
  REDIS_URL: Joi.string().default("redis://redis:6379"),
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "http", "debug")
    .default("info"),
}).unknown();

const { value: envVars, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV as string,
  port: envVars.PORT as number,
  mongoose: {
    uri: envVars.MONGODB_URI as string,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET as jwt.Secret,
    expire: envVars.JWT_EXPIRE as jwt.SignOptions["expiresIn"],
    refreshSecret: envVars.JWT_REFRESH_SECRET as jwt.Secret,
    refreshExpire: envVars.JWT_REFRESH_EXPIRE as jwt.SignOptions["expiresIn"],
  },
  bcrypt: {
    rounds: envVars.BCRYPT_ROUNDS as number,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS as number,
    max: envVars.RATE_LIMIT_MAX_REQUESTS as number,
  },
  cors: {
    origin: envVars.CORS_ORIGIN as string,
  },
  log: {
    level: envVars.LOG_LEVEL as string,
  },
  redis: {
    url: envVars.REDIS_URL as string,
  },
};

export default config;
