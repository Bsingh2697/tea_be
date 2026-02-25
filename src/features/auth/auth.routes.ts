import { Router } from "express";
import { validate } from "@shared/middlewares/validation.middleware";
import { protect } from "@shared/middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validation";
import authController from "./auth.controller";
import redisClient from "@shared/utils/redis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

const router = Router();

const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  message:
    "Too many login attempts from this IP, please try again in 5 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);

// TODO: Remove this later
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// Protected routes
router.get("/me", protect, authController.getCurrentUser);
router.post("/logout", protect, authController.logout);

export default router;
