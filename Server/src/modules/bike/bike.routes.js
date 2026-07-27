import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { createBikeSchema, updateBikeSchema, changeBikeStatusSchema } from './bike.validation.js';
import {
  createBikeController,
  getBikeListController,
  getBikeByIdController,
  updateBikeController,
  changeBikeStatusController,
  deleteBikeController,
} from './bike.controller.js';

const router = express.Router();

// Admin routes
// Keep the current access behavior while validating request data before it reaches the controller.
// router.post('/', protectAdmin, validate(createBikeSchema), createBikeController);
router.post('/', validate(createBikeSchema), createBikeController);

// router.get('/', protectAdmin, getBikeListController);
router.get('/', getBikeListController);
router.get('/:id', protectAdmin, getBikeByIdController);
router.patch('/:id', protectAdmin, validate(updateBikeSchema), updateBikeController);
router.patch('/:id/status', protectAdmin, validate(changeBikeStatusSchema), changeBikeStatusController);
router.delete('/:id', protectAdmin, deleteBikeController);

// Public routes - can be mounted separately or with optional auth
router.get('/public', getBikeListController); // Adjust for public
router.get('/public/:id', getBikeByIdController);

export default router;
