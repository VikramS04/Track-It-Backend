import express from "express";
import {
  createExpense,
  deleteExpense,
  deleteExpenses,
  getExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense,
} from "../controllers/expenseController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getExpenses)
  .post(createExpense)
  .delete(deleteExpenses);

router.get("/summary", getExpenseSummary);

router.route("/:id")
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
