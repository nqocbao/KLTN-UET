import express from "express";
import {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../../controllers/admin/hotels.controller.js";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.post("/", createHotel);
router.put("/:id", updateHotel);
router.delete("/:id", deleteHotel);

export default router;
