import express from "express";
import {
  getAllFavourites,
  getFavouriteById,
  createFavourite,
  deleteFavourite,
} from "../../controllers/admin/favourites.controller.js";

const router = express.Router();

router.get("/", getAllFavourites);
router.get("/:id", getFavouriteById);
router.post("/", createFavourite);
router.delete("/:id", deleteFavourite);

export default router;
