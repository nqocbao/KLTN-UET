import express from "express";
import {
  autocompleteHotelsWithSerpApi,
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  searchHotelsWithSerpApi,
} from "../../controllers/admin/hotels.controller.js";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/search", searchHotelsWithSerpApi);
router.get("/autocomplete", autocompleteHotelsWithSerpApi);
router.get("/:id", getHotelById);
router.post("/", createHotel);
router.put("/:id", updateHotel);
router.delete("/:id", deleteHotel);

export default router;
