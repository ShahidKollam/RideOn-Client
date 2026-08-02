import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { updateSettingsSchema } from './settings.validation.js';
import {
  getSettingsController,
  updateSettingsController,
} from './settings.controller.js';

const router = express.Router();

// router.get('/', protectAdmin, getSettingsController);
router.get('/',  getSettingsController);
router.patch('/', protectAdmin, validate(updateSettingsSchema), updateSettingsController);

export default router;
 