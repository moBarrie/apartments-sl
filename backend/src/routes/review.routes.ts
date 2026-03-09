import { Router } from "express";
import {
  createReview,
  getApartmentReviews,
} from "../controllers/review.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, createReview);
router.get("/apartment/:apartmentId", getApartmentReviews);

export default router;
