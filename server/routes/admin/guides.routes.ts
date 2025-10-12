import express from "express";
import {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
} from "../../controllers/admin/guides.controller.js";

const router = express.Router();

router.get("/", getAllGuides);
router.get("/:id", getGuideById);
router.post("/", createGuide);
router.put("/:id", updateGuide);
router.delete("/:id", deleteGuide);

export default router;
