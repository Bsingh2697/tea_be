import userService from "@features/user/user.service";
import jwt from "jsonwebtoken";
import {
  IAuthResponse,
  IAuthTokens,
  ILoginCredentials,
  IRegisterData,
  ITokenPayload,
} from "./auth.types";
import { config } from "@config/env";
import { AuthenticationError } from "@shared/utils/error";

export class AuthService {
  async register(registerData: IRegisterData): Promise<IAuthResponse> {
    const user = await userService.createUser(registerData);
    const tokens = this.generateTokens({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    await userService.updateRefreshToken(user?._id, tokens.refreshToken);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async login(loginData: ILoginCredentials): Promise<IAuthResponse> {
    const { email, password } = loginData;
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }
    if (!user.isActive) {
      throw new AuthenticationError("Your account has been deactivated");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }
    const userId = user._id as unknown as string;
    const tokens = this.generateTokens({
      id: userId,
      email: user.email,
      role: user.role,
    });
    await userService.updateRefreshToken(userId, tokens.refreshToken);
    return {
      user: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as ITokenPayload;
      const user = await userService.getUserByEmail(decoded.email);
      if (!user || user.refreshToken !== refreshToken) {
        throw new AuthenticationError("Invalid refresh token");
      }
      if (!user.isActive) {
        throw new AuthenticationError("Your account has been deactivated");
      }
      const tokens = this.generateTokens({
        id: user._id as unknown as string,
        email: user.email,
        role: user.role,
      });
      await userService.updateRefreshToken(
        user._id as unknown as string,
        tokens.refreshToken
      );
      return tokens;
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
  }

  async logout(userId: string): Promise<void> {
    await userService.updateRefreshToken(userId, null);
  }

  private generateTokens(payload: ITokenPayload): IAuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpire,
    });
    return { accessToken, refreshToken };
  }
}

export default new AuthService();
