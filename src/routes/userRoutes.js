import express from "express";
import {
  clearUserData,
  deleteCurrentUser,
  exportUserData,
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser);
router.get("/me/export", protect, exportUserData);
router.delete("/me/data", protect, clearUserData);
router.delete("/me", protect, deleteCurrentUser);

export default router;
