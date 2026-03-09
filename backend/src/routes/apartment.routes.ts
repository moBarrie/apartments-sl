import { Router } from "express";
import {
  getApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentAvailability,
} from "../controllers/apartment.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getApartments);
router.get("/:id", getApartmentById);
router.get("/:id/availability", getApartmentAvailability);

// Protected routes (Landlord only)
router.post("/", protect, authorize("LANDLORD", "ADMIN"), createApartment);
router.put("/:id", protect, authorize("LANDLORD", "ADMIN"), updateApartment);
router.delete("/:id", protect, authorize("LANDLORD", "ADMIN"), deleteApartment);

export default router;
