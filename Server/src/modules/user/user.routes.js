import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { updateProfileSchema } from './user.validation.js';
import { getProfileController, updateProfileController } from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getProfileController);
router.put('/profile', protect, validate(updateProfileSchema), updateProfileController);

export default router;
