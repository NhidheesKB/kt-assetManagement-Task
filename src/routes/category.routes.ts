import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
} from '../schemas/category.schema.js';

const router = Router();

router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', validate(getCategoryByIdSchema), deleteCategory);

export default router;
