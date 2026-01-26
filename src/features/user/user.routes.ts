import { authorize, protect } from "@shared/middlewares/auth.middleware";
import { Router } from "express";
import userController from "./user.controller";
import { UserRole } from "./user.types";
import validate from "@shared/middlewares/validation.middleware";
import {
  getAllUsersSchema,
  getUserSchema,
  updateUserSchema,
} from "./user.validation";

const router = Router();

// Protected Routes
router.use(protect);

// User Profile Routes
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

// Admin only routes
router.get(
  "/all",
  authorize(UserRole.ADMIN),
  validate(getAllUsersSchema),
  userController.getAllUsers,
);

router.get(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(getUserSchema),
  userController.getUserById,
);

router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(getUserSchema),
  userController.deleteUser,
);

export default router;
