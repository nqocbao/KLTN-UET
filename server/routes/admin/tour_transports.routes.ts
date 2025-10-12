import express from "express";
import {
  getAllTourTransports,
  getTourTransportById,
  createTourTransport,
  updateTourTransport,
  deleteTourTransport,
} from "../../controllers/admin/tour_transports.controller.js";

const router = express.Router();

router.get("/", getAllTourTransports);
router.get("/:id", getTourTransportById);
router.post("/", createTourTransport);
router.put("/:id", updateTourTransport);
router.delete("/:id", deleteTourTransport);

export default router;
