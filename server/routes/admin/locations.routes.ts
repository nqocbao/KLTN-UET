import express from "express";
import { searchLocations } from "../../controllers/admin/locations.controller.js";

const router = express.Router();

// Search across all location types
router.get("/search", searchLocations);

export default router;
