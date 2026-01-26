import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler";
import ResponseHandler from "@shared/utils/response";
import userService from "./user.service";
import { AuthorizationError } from "@shared/utils/error";

export class UserController {
  getProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = await userService.getUserById(req.user._id);
      return ResponseHandler.success(res, user, "Profile fetched successfully");
    },
  );
  updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = await userService.updateUser(req.user._id, req.body);
      return ResponseHandler.success(res, user, "Profile updated successfully");
    },
  );
  getUserById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = await userService.getUserById(req.params.id);
      return ResponseHandler.success(res, user, "User fetched successfully");
    },
  );
  updateUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = await userService.updateUser(req.params.id, req.body);
      return ResponseHandler.success(res, user, "User updated successfully");
    },
  );
  deleteUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (req.user._id.toString() === req.params.id) {
        throw new AuthorizationError("You cannot delete your own account");
      }
      await userService.deleteUser(req.params.id);
      return ResponseHandler.success(res, null, "User deleted successfully");
    },
  );
  getAllUsers = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filter: any = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.isActive !== undefined)
        filter.isActive = req.query.isActive;
      const { users, total } = await userService.getAllUsers(
        page,
        limit,
        filter,
      );
      return ResponseHandler.paginated(
        res,
        users,
        page,
        limit,
        total,
        "Users fetched successfully",
      );
    },
  );
}

export default new UserController();
