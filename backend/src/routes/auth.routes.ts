import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);

export default router;
