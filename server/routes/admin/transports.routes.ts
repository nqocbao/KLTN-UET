import express from "express";
import {
  getAllTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
} from "../../controllers/admin/transports.controller.js";

const router = express.Router();

router.get("/", getAllTransports);
router.get("/:id", getTransportById);
router.post("/", createTransport);
router.put("/:id", updateTransport);
router.delete("/:id", deleteTransport);

export default router;
