import express from "express";
import {
  getAllTourDestinations,
  getTourDestinationById,
  createTourDestination,
  updateTourDestination,
  deleteTourDestination,
} from "../../controllers/admin/tour_destinations.controller.js";

const router = express.Router();

router.get("/", getAllTourDestinations);
router.get("/:id", getTourDestinationById);
router.post("/", createTourDestination);
router.put("/:id", updateTourDestination);
router.delete("/:id", deleteTourDestination);

export default router;
