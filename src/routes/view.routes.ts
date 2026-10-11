import { Router } from 'express';
import {
  renderStock,
  renderAssets,
  renderAssetHistory,
  renderEmployees,
  renderCategories,
  renderBranches,
} from '../controllers/view.controller.js';

const router = Router();

router.get('/', (_req, res) => res.redirect('/stock'));
router.get('/stock', renderStock);
router.get('/assets', renderAssets);
router.get('/assets/:id/history', renderAssetHistory);
router.get('/employees', renderEmployees);
router.get('/categories', renderCategories);
router.get('/branches', renderBranches);

export default router;

