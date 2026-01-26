import User from "./user.model";
import { IUser, IUserCreate, IUserUpdate, IUserResponse } from "./user.types";
import { NotFoundError, ConflictError } from "@shared/utils/error";

export class UserService {
  async createUser(userData: IUserCreate): Promise<IUserResponse> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }
    const user = await User.create(userData);
    return this.sanitizeUser(user);
  }

  async getUserById(userId: string): Promise<IUserResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this.sanitizeUser(user);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password +refreshToken");
  }

  async updateUser(
    userId: string,
    updateData: IUserUpdate,
  ): Promise<IUserResponse> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this.sanitizeUser(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filter: any = {},
  ): Promise<{ users: IUserResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    return {
      users: users.map((user) => this.sanitizeUser(user)),
      total,
    };
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken });
  }

  private sanitizeUser(user: IUser): IUserResponse {
    const userObj = user.toObject();
    const { _id, password, refreshToken, __v, ...sanitized } = userObj;
    return { userId: _id, ...sanitized } as IUserResponse;
  }
}

export default new UserService();
