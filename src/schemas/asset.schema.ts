import { z } from 'zod';

export const assetBodySchema = z.object({
  serialNumber: z.string().trim().min(1).max(150),
  categoryId: z.uuidv7(),
  branchId: z.uuidv7(),
  make: z.string().trim().max(100).optional(),
  model: z.string().trim().max(100).optional(),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  purchaseValue: z.coerce.number().min(0).default(0),
});

export const createAssetSchema = z.object({
  body: assetBodySchema,
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
  body: assetBodySchema.partial(),
});

export const getAssetByIdSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
});

export const getAssetsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    }, z.coerce.number().int().positive().default(1)),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.preprocess((val) => (val === '' ? undefined : val), z.string().trim().optional()),
    categoryId: z.preprocess((val) => (val === '' ? undefined : val), z.uuidv7().optional()),
    branchId: z.preprocess((val) => (val === '' ? undefined : val), z.uuidv7().optional()),
    status: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['IN_STOCK', 'ISSUED', 'REPAIR', 'SCRAPPED']).optional()),
    includeScrapped: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['true', 'false']).optional()),
  }),
});

export const updateAssetStatusSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
  body: z.discriminatedUnion('action', [
    z.object({
      action: z.literal('ISSUE'),
      employeeId: z.uuidv7(),
      remarks: z.string().trim().max(500).optional(),
    }),
    z.object({
      action: z.literal('RETURN'),
      reason: z.string().trim().min(1).max(150),
      condition: z.enum(['IN_STOCK', 'REPAIR']).default('IN_STOCK'),
      remarks: z.string().trim().max(500).optional(),
    }),
    z.object({
      action: z.literal('SCRAP'),
      reason: z.string().trim().min(1).max(150),
      remarks: z.string().trim().max(500).optional(),
    }),
    z.object({
      action: z.literal('REPAIR'),
      reason: z.string().trim().max(150).optional(),
      remarks: z.string().trim().max(500).optional(),
      employeeId: z.uuidv7().optional(),
    }),
  ]),
});

export const getStockQuerySchema = z.object({
  query: z.object({
    branchId: z.preprocess((val) => (val === '' ? undefined : val), z.uuidv7().optional()),
    search: z.preprocess((val) => (val === '' ? undefined : val), z.string().trim().optional()),
    page: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    }, z.coerce.number().int().positive().default(1)),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const getAssetHistorySchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
  query: z.object({
    page: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    }, z.coerce.number().int().positive().default(1)),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateAssetInput = z.infer<typeof assetBodySchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>['body'];
export type GetAssetsQuery = z.infer<typeof getAssetsQuerySchema>['query'];
export type UpdateAssetStatusInput = z.infer<typeof updateAssetStatusSchema>['body'];
export type GetStockQuery = z.infer<typeof getStockQuerySchema>['query'];
export type GetAssetHistoryQuery = z.infer<typeof getAssetHistorySchema>['query'];
