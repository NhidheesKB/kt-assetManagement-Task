import { Router } from 'express';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getActiveEmployees,
} from '../controllers/employee.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeByIdSchema,
} from '../schemas/employee.schema.js';

const router = Router();

router.get('/active', getActiveEmployees);
router.post('/', validate(createEmployeeSchema), createEmployee);
router.put('/:id', validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', validate(getEmployeeByIdSchema), deleteEmployee);

export default router;
