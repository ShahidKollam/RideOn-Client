import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import {
  createPricingController,
  getPricingListController,
  getPricingByIdController,
  updatePricingController,
  deletePricingController,
} from './pricing.controller.js';

const router = express.Router();

router.post('/', protectAdmin, createPricingController);
router.get('/', protectAdmin, getPricingListController);
router.get('/:id', protectAdmin, getPricingByIdController);
router.patch('/:id', protectAdmin, updatePricingController);
router.delete('/:id', protectAdmin, deletePricingController);

export default router;
