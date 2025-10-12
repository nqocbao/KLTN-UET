import express from "express";
import {
  getAllDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "../../controllers/admin/districts.controller.js";

const router = express.Router();

router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);
router.post("/", createDistrict);
router.put("/:id", updateDistrict);
router.delete("/:id", deleteDistrict);

export default router;
