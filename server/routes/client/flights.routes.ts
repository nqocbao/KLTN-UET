import express from 'express';
import { transportsController } from '../../controllers/client/transports.controller.js';

const router = express.Router();

// GET /api/client/flights/search?from=SGN&to=HAN&date=2026-03-15
// Fetch từ SerpAPI → upsert DB → trả về data từ DB
router.get('/search', transportsController.searchFlights);

// GET /api/client/flights - Get all flights with filters (từ DB)
router.get('/', transportsController.getFlights);

// GET /api/client/flights/:id - Get flight by ID
router.get('/:id', transportsController.getById);

export default router;
