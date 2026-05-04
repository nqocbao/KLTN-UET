import express from "express";
import { foodReviewsController } from "../../controllers/client/food_reviews.controller.js";

const router = express.Router();

router.get("/", foodReviewsController.getFoodReviews);
router.get("/trending", foodReviewsController.getTrendingFoodReviews);
router.get("/areas", foodReviewsController.getFoodReviewAreas);
router.get("/:id/enriched", foodReviewsController.getFoodReviewEnrichedDetail);
router.get("/:id", foodReviewsController.getFoodReviewById);

export default router;
