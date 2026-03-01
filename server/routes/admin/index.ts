import express from "express";
import { requireAdmin } from "../../middlewares/admin/auth.middlewares.js";

// Import all route modules
import usersRoutes from "./users.routes.js";
import rolesRoutes from "./roles.routes.js";
import permissionsRoutes from "./permissions.routes.js";
import countriesRoutes from "./countries.routes.js";
import provincesRoutes from "./provinces.routes.js";
import districtsRoutes from "./districts.routes.js";
import wardsRoutes from "./wards.routes.js";
import addressesRoutes from "./addresses.routes.js";
import partnersRoutes from "./partners.routes.js";
import hotelsRoutes from "./hotels.routes.js";
import restaurantsRoutes from "./restaurants.routes.js";
import transportsRoutes from "./transports.routes.js";
import airlinesRoutes from "./airlines.routes.js";
import destinationsRoutes from "./destinations.routes.js";
import guidesRoutes from "./guides.routes.js";
import toursRoutes from "./tours.routes.js";
import tourDestinationsRoutes from "./tour_destinations.routes.js";
import tourTransportsRoutes from "./tour_transports.routes.js";
import tourReviewsRoutes from "./tour_reviews.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import favouritesRoutes from "./favourites.routes.js";
import travelHistoryRoutes from "./travel_history.routes.js";
import conversationsRoutes from "./conversations.routes.js";
import messagesRoutes from "./messages.routes.js";
import intentsRoutes from "./intents.routes.js";
import entitiesRoutes from "./entities.routes.js";
import locationsRoutes from "./locations.routes.js";
import servicesRoutes from "./services.routes.js";

const router = express.Router();

// Apply admin authentication to ALL admin routes
router.use(requireAdmin);

// Mount all routes
router.use("/users", usersRoutes);
router.use("/roles", rolesRoutes);
router.use("/permissions", permissionsRoutes);
router.use("/countries", countriesRoutes);
router.use("/provinces", provincesRoutes);
router.use("/districts", districtsRoutes);
router.use("/wards", wardsRoutes);
router.use("/addresses", addressesRoutes);
router.use("/partners", partnersRoutes);
router.use("/hotels", hotelsRoutes);
router.use("/restaurants", restaurantsRoutes);
router.use("/transports", transportsRoutes);
router.use("/airlines", airlinesRoutes);
router.use("/destinations", destinationsRoutes);
router.use("/guides", guidesRoutes);
router.use("/tours", toursRoutes);
router.use("/tour-destinations", tourDestinationsRoutes);
router.use("/tour-transports", tourTransportsRoutes);
router.use("/tour-reviews", tourReviewsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/favourites", favouritesRoutes);
router.use("/travel-history", travelHistoryRoutes);
router.use("/conversations", conversationsRoutes);
router.use("/messages", messagesRoutes);
router.use("/intents", intentsRoutes);
router.use("/entities", entitiesRoutes);
router.use("/locations", locationsRoutes);
router.use("/services", servicesRoutes);

export default router;
