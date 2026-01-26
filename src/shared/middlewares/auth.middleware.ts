import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@config/env";
import { AuthenticationError, AuthorizationError } from "@shared/utils/error";
import { asyncHandler } from "@shared/utils/asyncHandler";
import User from "@features/user/user.model";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// For Authorized Users
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AuthenticationError("Not authorized to access this route");
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        throw new AuthenticationError("User no longer exists");
      }

      if (!user.isActive) {
        throw new AuthenticationError("User account is deactivated");
      }

      req.user = user;
      next();
    } catch (error) {
      throw new AuthenticationError("Not authorized to access this route");
    }
  }
);

// For Admin
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError("Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

export default { protect, authorize };
