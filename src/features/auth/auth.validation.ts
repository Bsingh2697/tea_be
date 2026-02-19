import { UserRole } from "@features/user/user.types";
import Joi from "joi";

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .optional(),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    password: Joi.string().required(),
  })
    .or("email", "phone")
    .messages({
      "object.missing": "Either email or phone number is required",
    }),
});

export const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});
