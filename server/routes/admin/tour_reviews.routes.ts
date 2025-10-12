import express from "express";
import {
  getAllTourReviews,
  getTourReviewById,
  createTourReview,
  updateTourReview,
  deleteTourReview,
} from "../../controllers/admin/tour_reviews.controller.js";

const router = express.Router();

router.get("/", getAllTourReviews);
router.get("/:id", getTourReviewById);
router.post("/", createTourReview);
router.put("/:id", updateTourReview);
router.delete("/:id", deleteTourReview);

export default router;
