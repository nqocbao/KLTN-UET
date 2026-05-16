import express from "express";
import {
  listMyFavourites,
  checkFavourite,
  addFavourite,
  removeFavourite,
} from "../../controllers/client/favourites.controller.js";
import { requireAuth } from "../../middlewares/client/user.middlewares.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listMyFavourites);
router.get("/check", checkFavourite);
router.post("/", addFavourite);
router.delete("/", removeFavourite);

export default router;
