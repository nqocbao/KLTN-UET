import express from "express";
import {
  commitFoodReviewImportSession,
  commitFoodReviewImport,
  getFoodReviewImportPreviewSessionRow,
  getFoodReviewImportPreviewSessionPage,
  getAdminFoodReviewById,
  getAdminFoodReviews,
  previewFoodReviewImportSession,
  previewFoodReviewImport,
  updateFoodReviewImportPreviewSessionRow,
  updateAdminFoodReview,
} from "../../controllers/admin/food_reviews.controller.js";

const router = express.Router();

router.get("/", getAdminFoodReviews);
router.post("/import/preview/session", previewFoodReviewImportSession);
router.get("/import/preview/session/:sessionId", getFoodReviewImportPreviewSessionPage);
router.get("/import/preview/session/:sessionId/row/:rowNumber", getFoodReviewImportPreviewSessionRow);
router.patch("/import/preview/session/:sessionId/row/:rowNumber", updateFoodReviewImportPreviewSessionRow);
router.post("/import/commit/session/:sessionId", commitFoodReviewImportSession);
router.post("/import/preview", previewFoodReviewImport);
router.post("/import/commit", commitFoodReviewImport);
router.get("/:id", getAdminFoodReviewById);
router.patch("/:id", updateAdminFoodReview);

export default router;
