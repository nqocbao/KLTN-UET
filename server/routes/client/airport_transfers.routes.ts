import express from 'express';
import { transportsController } from '../../controllers/client/transports.controller.js';

const router = express.Router();

// GET /api/client/airport-transfers - Get all transfers with filters
router.get('/', transportsController.getAirportTransfers);

// GET /api/client/airport-transfers/:id - Get transfer by ID
router.get('/:id', transportsController.getById);

export default router;
