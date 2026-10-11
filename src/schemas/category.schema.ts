import { z } from 'zod';

export const categoryBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

export const createCategorySchema = z.object({
  body: categoryBodySchema,
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
  body: categoryBodySchema.partial(),
});

export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
});

export const getCategoriesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    }, z.coerce.number().int().positive().default(1)),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.preprocess((val) => (val === '' ? undefined : val), z.string().trim().optional()),
  }),
});

export type CreateCategoryInput = z.infer<typeof categoryBodySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>['query'];
