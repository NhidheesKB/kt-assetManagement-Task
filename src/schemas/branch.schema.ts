import { z } from 'zod';

export const branchBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(255),
  phoneNumber: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
});

export const createBranchSchema = z.object({
  body: branchBodySchema,
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
  body: branchBodySchema.partial(),
});

export const getBranchByIdSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
});

export const getBranchesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    }, z.coerce.number().int().positive().default(1)),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.preprocess((val) => (val === '' ? undefined : val), z.string().trim().optional()),
  }),
});

export type CreateBranchInput = z.infer<typeof branchBodySchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>['body'];
export type GetBranchesQuery = z.infer<typeof getBranchesQuerySchema>['query'];
