import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } from 'sequelize';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error caught by global handler:', err);

  switch (true) {
    case err instanceof ZodError:
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.issues.map((i: any) => ({
          field: i.path.join('.').replace(/^(body|query|params)\./, ''),
          message: i.message,
        })),
      });
      return;

    case err instanceof UniqueConstraintError:
      res.status(409).json({
        success: false,
        message: 'Duplicate entry: A record with this unique field already exists',
        errors: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
      return;

    case err instanceof ForeignKeyConstraintError:
      res.status(400).json({
        success: false,
        message: 'Foreign key constraint error: referenced entity does not exist or cannot be deleted while linked.',
      });
      return;

    case err instanceof ValidationError:
      res.status(400).json({
        success: false,
        message: err.message,
        errors: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
      return;

    default: {
      const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
      });
      return;
    }
  }
};
