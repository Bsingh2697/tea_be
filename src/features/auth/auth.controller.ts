import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler";
import ResponseHandler from "@shared/utils/response";
import authService from "./auth.service";

export class AuthController {
  register = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const authResponse = await authService.register(req.body);
      return ResponseHandler.created(
        res,
        authResponse,
        "User registered successfully"
      );
    }
  );
  login = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const authResponse = await authService.login(req.body);
      return ResponseHandler.success(res, authResponse, "Login successful");
    }
  );
  refreshToken = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      return ResponseHandler.success(
        res,
        tokens,
        "Token refreshed successfully"
      );
    }
  );
  logout = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      await authService.logout(req.user._id);
      return ResponseHandler.success(res, null, "Logout Successful");
    }
  );
  getCurrentUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      return ResponseHandler.success(
        res,
        req.user,
        "Current user fetched successfully"
      );
    }
  );
}
export default new AuthController();
