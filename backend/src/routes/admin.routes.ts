import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllApartments,
  updateApartmentStatus,
  getAllBookings,
} from "../controllers/admin.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(protect, authorize("ADMIN"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/apartments", getAllApartments);
router.patch("/apartments/:id/status", updateApartmentStatus);
router.get("/bookings", getAllBookings);

export default router;
