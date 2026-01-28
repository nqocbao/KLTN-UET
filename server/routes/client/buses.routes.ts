import express from 'express';
import { transportsController } from '../../controllers/client/transports.controller.js';

const router = express.Router();

// GET /api/client/buses - Get all buses with filters
router.get('/', transportsController.getBuses);

// GET /api/client/buses/:id - Get bus by ID
router.get('/:id', transportsController.getById);

export default router;
