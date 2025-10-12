import express from "express";
import {
  getAllEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
} from "../../controllers/admin/entities.controller.js";

const router = express.Router();

router.get("/", getAllEntities);
router.get("/:id", getEntityById);
router.post("/", createEntity);
router.put("/:id", updateEntity);
router.delete("/:id", deleteEntity);

export default router;
