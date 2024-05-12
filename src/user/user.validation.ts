import { ZodType, z } from 'zod';

export class UserValidation {
  static readonly SERACH: ZodType = z.object({
    email: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
    sortDirection: z.enum(['asc', 'desc']),
    sortColumn: z.enum(['id', 'name', 'email']),
  });
}
