import express from "express";
import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from "../../controllers/admin/partners.controller.js";

const router = express.Router();

router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.post("/", createPartner);
router.put("/:id", updatePartner);
router.delete("/:id", deletePartner);

export default router;
