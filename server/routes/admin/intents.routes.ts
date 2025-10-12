import express from "express";
import {
  getAllIntents,
  getIntentById,
  createIntent,
  updateIntent,
  deleteIntent,
} from "../../controllers/admin/intents.controller.js";

const router = express.Router();

router.get("/", getAllIntents);
router.get("/:id", getIntentById);
router.post("/", createIntent);
router.put("/:id", updateIntent);
router.delete("/:id", deleteIntent);

export default router;
