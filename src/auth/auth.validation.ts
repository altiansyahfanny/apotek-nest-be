import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().min(1).max(100).email(),
    name: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(100),
  });

  static readonly FORGOT_PASSWORD: ZodType = z.object({
    email: z.string().min(1).max(100).email(),
  });

  static readonly RESET_PASSWORD: ZodType = z.object({
    token: z.string().min(1),
    password: z.string().min(1).max(100),
  });
}
