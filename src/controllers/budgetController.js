import Budget from "../models/budgetModel.js";
import Expense from "../models/expenseModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getCurrentMonthRange } from "../utils/dateRanges.js";

const defaultBudgets = [
  { name: "Food & Dining", category: "Food", icon: "🛒", total: 0, color: "bg-green-500", colorHex: "#22c55e" },
  { name: "Transport", category: "Transport", icon: "🚗", total: 0, color: "bg-yellow-500", colorHex: "#eab308" },
  { name: "Entertainment", category: "Entertainment", icon: "🎬", total: 0, color: "bg-red-500", colorHex: "#ef4444" },
  { name: "Utilities", category: "Utilities", icon: "⚡", total: 0, color: "bg-blue-500", colorHex: "#3b82f6" },
  { name: "Health", category: "Health", icon: "💪", total: 0, color: "bg-purple-500", colorHex: "#a855f7" },
  { name: "Shopping", category: "Shopping", icon: "🛍️", total: 0, color: "bg-pink-500", colorHex: "#ec4899" },
];

const toBudgetResponse = (budget, spent = 0) => {
  const plain = budget.toObject ? budget.toObject() : budget;
  return {
    ...plain,
    id: plain._id,
    spent,
  };
};

const ensureDefaultBudgets = async (userId) => {
  const count = await Budget.countDocuments({ user: userId });

  if (count > 0) return;

  await Budget.insertMany(defaultBudgets.map((budget) => ({
    ...budget,
    user: userId,
  })));
};

const getSpentByCategory = async (userId) => {
  const { start, end } = getCurrentMonthRange();
  const rows = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } },
  ]);

  return new Map(rows.map((row) => [row._id, row.spent]));
};

export const getBudgets = asyncHandler(async (req, res) => {
  await ensureDefaultBudgets(req.user._id);

  const [budgets, spentByCategory] = await Promise.all([
    Budget.find({ user: req.user._id }).sort({ createdAt: 1 }),
    getSpentByCategory(req.user._id),
  ]);

  res.json({
    budgets: budgets.map((budget) => toBudgetResponse(budget, spentByCategory.get(budget.category) || 0)),
  });
});

export const createBudget = asyncHandler(async (req, res) => {
  const { name, category, total, icon, color, colorHex } = req.body;

  if (!name || !total) {
    res.status(400);
    throw new Error("Please provide budget name and amount");
  }

  const budget = await Budget.create({
    user: req.user._id,
    name,
    category: category || name,
    total,
    icon: icon || "📦",
    color: color || "bg-blue-500",
    colorHex: colorHex || "#3b82f6",
  });

  res.status(201).json({ budget: toBudgetResponse(budget, 0) });
});

export const updateBudget = asyncHandler(async (req, res) => {
  const updates = {};

  ["name", "category", "total", "icon", "color", "colorHex"].forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    { new: true, runValidators: true },
  );

  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }

  const spentByCategory = await getSpentByCategory(req.user._id);
  res.json({ budget: toBudgetResponse(budget, spentByCategory.get(budget.category) || 0) });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }

  res.json({ id: req.params.id, message: "Budget deleted" });
});
