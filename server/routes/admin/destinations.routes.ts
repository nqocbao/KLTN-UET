import express from "express";
import {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationSuggestions,
} from "../../controllers/admin/destinations.controller.js";

const router = express.Router();

router.get("/suggestions", getDestinationSuggestions);
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);
router.post("/", createDestination);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

export default router;
