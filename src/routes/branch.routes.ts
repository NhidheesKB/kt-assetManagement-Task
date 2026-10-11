import { Router } from 'express';
import {
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createBranchSchema,
  updateBranchSchema,
  getBranchByIdSchema,
} from '../schemas/branch.schema.js';

const router = Router();

router.post('/', validate(createBranchSchema), createBranch);
router.put('/:id', validate(updateBranchSchema), updateBranch);
router.delete('/:id', validate(getBranchByIdSchema), deleteBranch);

export default router;
