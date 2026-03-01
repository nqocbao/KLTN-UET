import { Router } from "express";
import { smartSearch } from "../../controllers/client/search.controller.js";

const router = Router();

// Smart search endpoint - tìm kiếm thông minh qua tours, destinations, provinces, countries
router.get("/smart", smartSearch);

export default router;
