import Joi from "joi";
import { UserRole } from "./user.types";

export const createUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid(...Object.values(UserRole)),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
  }),
});

export const updateUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(50),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipcode: Joi.string(),
      country: Joi.string(),
    }),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const getUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

export const getAllUsersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid(...Object.values(UserRole)),
    isActive: Joi.boolean(),
  }),
});
