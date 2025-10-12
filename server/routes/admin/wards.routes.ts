import express from "express";
import {
  getAllWards,
  getWardById,
  createWard,
  updateWard,
  deleteWard,
} from "../../controllers/admin/wards.controller.js";

const router = express.Router();

router.get("/", getAllWards);
router.get("/:id", getWardById);
router.post("/", createWard);
router.put("/:id", updateWard);
router.delete("/:id", deleteWard);

export default router;
