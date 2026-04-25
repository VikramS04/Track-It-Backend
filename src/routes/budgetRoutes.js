import express from "express";
import { createBudget, deleteBudget, getBudgets, updateBudget } from "../controllers/budgetController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getBudgets)
  .post(createBudget);

router.route("/:id")
  .put(updateBudget)
  .delete(deleteBudget);

export default router;
