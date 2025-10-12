import express from "express";
import {
  getAllProvinces,
  getProvinceById,
  createProvince,
  updateProvince,
  deleteProvince,
} from "../../controllers/admin/provinces.controller.js";

const router = express.Router();

router.get("/", getAllProvinces);
router.get("/:id", getProvinceById);
router.post("/", createProvince);
router.put("/:id", updateProvince);
router.delete("/:id", deleteProvince);

export default router;
