import { z } from 'zod';

export const employeeBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().max(150),
  branchId: z.uuidv7(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const createEmployeeSchema = z.object({
  body: employeeBodySchema,
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
  body: employeeBodySchema.partial(),
});

export const getEmployeeByIdSchema = z.object({
  params: z.object({
    id: z.uuidv7(),
  }),
});

export const getEmployeesQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) || num < 1 ? 1 : Math.floor(num);
    }, z.coerce.number().int().positive().default(1)),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.preprocess((val) => (val === '' ? undefined : val), z.string().trim().optional()),
    status: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['ACTIVE', 'INACTIVE']).optional()),
    branchId: z.preprocess((val) => (val === '' ? undefined : val), z.uuidv7().optional()),
  }),
});

export type CreateEmployeeInput = z.infer<typeof employeeBodySchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type GetEmployeesQuery = z.infer<typeof getEmployeesQuerySchema>['query'];
