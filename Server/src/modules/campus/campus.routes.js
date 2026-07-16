import express from 'express';
import { getActiveCampusesController } from './campus.controller.js';

const router = express.Router();

router.get('/active', getActiveCampusesController);

export default router;
