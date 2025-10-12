import express from "express";
import {
  getAllAirlines,
  getAirlineById,
  createAirline,
  updateAirline,
  deleteAirline,
} from "../../controllers/admin/airlines.controller.js";

const router = express.Router();

router.get("/", getAllAirlines);
router.get("/:id", getAirlineById);
router.post("/", createAirline);
router.put("/:id", updateAirline);
router.delete("/:id", deleteAirline);

export default router;
