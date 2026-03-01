import express from "express";

import authRoutes from "./auth.routes.js";
import hotelsRoutes from "../admin/hotels.routes.js";
import toursRoutes from "../admin/tours.routes.js";
import destinationsRoutes from "../admin/destinations.routes.js";
import busesRoutes from "./buses.routes.js";
import airportTransfersRoutes from "./airport_transfers.routes.js";
import flightsRoutes from "./flights.routes.js";
import provincesRoutes from "../admin/provinces.routes.js";
import countriesRoutes from "../admin/countries.routes.js";
import districtsRoutes from "../admin/districts.routes.js";
import wardsRoutes from "../admin/wards.routes.js";
import locationsRoutes from "../admin/locations.routes.js";
import restaurantsRoutes from "../admin/restaurants.routes.js";
import guidesRoutes from "../admin/guides.routes.js";
import partnersRoutes from "../admin/partners.routes.js";
import servicesRoutes from "../admin/services.routes.js";

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Public data routes (no auth required - read-only usage by public pages)
router.use("/hotels", hotelsRoutes);
router.use("/tours", toursRoutes);
router.use("/destinations", destinationsRoutes);
router.use("/provinces", provincesRoutes);
router.use("/countries", countriesRoutes);
router.use("/districts", districtsRoutes);
router.use("/wards", wardsRoutes);
router.use("/locations", locationsRoutes);
router.use("/restaurants", restaurantsRoutes);
router.use("/guides", guidesRoutes);
router.use("/partners", partnersRoutes);
router.use("/services", servicesRoutes);
router.use("/buses", busesRoutes);
router.use("/airport-transfers", airportTransfersRoutes);
router.use("/flights", flightsRoutes);

export default router;
