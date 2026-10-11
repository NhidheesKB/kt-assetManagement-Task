import { Router } from 'express';
import {
  createAsset,
  updateAsset,
  deleteAsset,
  updateAssetStatus,
} from '../controllers/asset.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createAssetSchema,
  updateAssetSchema,
  getAssetByIdSchema,
  updateAssetStatusSchema,
} from '../schemas/asset.schema.js';

const router = Router();

router.post('/', validate(createAssetSchema), createAsset);
router.put('/:id', validate(updateAssetSchema), updateAsset);
router.delete('/:id', validate(getAssetByIdSchema), deleteAsset);
router.post('/:id/update-status', validate(updateAssetStatusSchema), updateAssetStatus);

export default router;
