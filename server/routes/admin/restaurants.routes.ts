import express from "express";
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../../controllers/admin/restaurants.controller.js";

const router = express.Router();

router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);
router.post("/", createRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);

export default router;
