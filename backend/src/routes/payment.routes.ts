import { Router } from "express";
import {
  createPaymentIntent,
  handleStripeWebhook,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/webhook/stripe", handleStripeWebhook);

export default router;
