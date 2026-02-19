import { Document } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  VENDOR = "vendor",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone: string;
}

export interface IUserUpdate {
  name: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: any;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
