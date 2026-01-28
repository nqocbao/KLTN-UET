import express from 'express';
import { transportsController } from '../../controllers/client/transports.controller.js';

const router = express.Router();

// GET /api/client/flights - Get all flights with filters
router.get('/', transportsController.getFlights);

// GET /api/client/flights/:id - Get flight by ID
router.get('/:id', transportsController.getById);

export default router;
