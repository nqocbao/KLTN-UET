import express from "express";
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
} from "../../controllers/admin/countries.controller.js";

const router = express.Router();

router.get("/", getAllCountries);
router.get("/:id", getCountryById);
router.post("/", createCountry);
router.put("/:id", updateCountry);
router.delete("/:id", deleteCountry);

export default router;
