import express from "express";
import {
  getAllTravelHistory,
  getTravelHistoryById,
  createTravelHistory,
  deleteTravelHistory,
} from "../../controllers/admin/travel_history.controller.js";

const router = express.Router();

router.get("/", getAllTravelHistory);
router.get("/:id", getTravelHistoryById);
router.post("/", createTravelHistory);
router.delete("/:id", deleteTravelHistory);

export default router;
