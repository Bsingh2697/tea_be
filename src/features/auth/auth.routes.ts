import { Router } from "express";
import { validate } from "@shared/middlewares/validation.middleware";
import { protect } from "@shared/middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validation";
import authController from "./auth.controller";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// TODO: Remove this later
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// Protected routes
router.post("/logout", protect, authController.logout);

export default router;
