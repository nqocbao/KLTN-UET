import express from "express";

import hotelsRoutes from "../admin/hotels.routes.js";
import toursRoutes from "../admin/tours.routes.js";
import destinationsRoutes from "../admin/destinations.routes.js";
import busesRoutes from "./buses.routes.js";
import airportTransfersRoutes from "./airport_transfers.routes.js";
import flightsRoutes from "./flights.routes.js";

const router = express.Router();

// Client-facing routes (could add different logic/filtering later)
router.use("/hotels", hotelsRoutes);
router.use("/tours", toursRoutes);
router.use("/destinations", destinationsRoutes);
router.use("/buses", busesRoutes);
router.use("/airport-transfers", airportTransfersRoutes);
router.use("/flights", flightsRoutes);

export default router;
