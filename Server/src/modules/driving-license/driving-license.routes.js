import express from 'express';
import { validate } from '../../middlewares/validation.middleware.js';
import { uploadLicenseSchema } from './driving-license.validation.js';
import { 
  uploadLicenseController, 
  updateLicenseController, 
  getLicenseController 
} from './driving-license.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, validate(uploadLicenseSchema), uploadLicenseController);
router.put('/', protect, validate(uploadLicenseSchema), updateLicenseController);
router.get('/', protect, getLicenseController);

export default router;
