import Budget from "../models/budgetModel.js";
import Expense from "../models/expenseModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getLastSixMonthStarts, getPeriodRange } from "../utils/dateRanges.js";

const categoryIcons = {
  Entertainment: "🎬",
  Food: "🛒",
  Transport: "🚗",
  Utilities: "⚡",
  Health: "💪",
  Shopping: "🛍️",
  Education: "📚",
  Housing: "🏠",
};

const chartColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#0ea5e9", "#ec4899", "#f59e0b"];

const getMonthlyTrend = async (userId) => {
  const months = getLastSixMonthStarts();
  const start = months[0];
  const end = new Date(months[months.length - 1].getFullYear(), months[months.length - 1].getMonth() + 1, 1);

  const rows = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        amount: { $sum: "$amount" },
      },
    },
  ]);

  const byMonth = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row.amount]));

  return months.map((monthStart) => ({
    month: monthStart.toLocaleString("en-US", { month: "short" }),
    amount: byMonth.get(`${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`) || 0,
  }));
};

const getCategoryBreakdown = async (userId, range) => {
  const [current, previous] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: range.start, $lte: range.end } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: range.previousStart, $lt: range.previousEnd } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
    ]),
  ]);

  const previousByCategory = new Map(previous.map((row) => [row._id, row.amount]));
  const total = current.reduce((sum, row) => sum + row.amount, 0);

  return current.map((row, index) => {
    const previousAmount = previousByCategory.get(row._id) || 0;
    const diff = previousAmount ? Math.round(((row.amount - previousAmount) / previousAmount) * 100) : 0;

    return {
      name: row._id,
      amount: row.amount,
      pct: total ? Math.round((row.amount / total) * 100) : 0,
      icon: categoryIcons[row._id] || "📦",
      color: chartColors[index % chartColors.length],
      trend: `${diff >= 0 ? "+" : ""}${diff}%`,
    };
  });
};

export const getReports = asyncHandler(async (req, res) => {
  const period = ["week", "month", "year"].includes(req.query.period) ? req.query.period : "month";
  const range = getPeriodRange(period);

  const [periodRows, monthlyData, categoryBreakdown, budgets] = await Promise.all([
    Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: range.start, $lte: range.end } } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" }, transactions: { $sum: 1 } } },
    ]),
    getMonthlyTrend(req.user._id),
    getCategoryBreakdown(req.user._id, range),
    Budget.find({ user: req.user._id }),
  ]);

  const totalSpent = periodRows[0]?.totalSpent || 0;
  const avgMonthly = Math.round(monthlyData.reduce((sum, row) => sum + row.amount, 0) / Math.max(monthlyData.length, 1));
  const highestMonth = monthlyData.reduce((highest, row) => row.amount > highest.amount ? row : highest, monthlyData[0] || { month: "N/A", amount: 0 });
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.total, 0);
  const savingsRate = totalBudget ? Math.max(0, Math.round(((totalBudget - totalSpent) / totalBudget) * 100)) : 0;
  const overspent = categoryBreakdown.find((category) => {
    const budget = budgets.find((item) => item.category === category.name);
    return budget && category.amount > budget.total;
  });

  res.json({
    report: {
      period,
      totalSpent,
      avgMonthly,
      highestMonth,
      savingsRate,
      monthlyData,
      categoryBreakdown,
      insights: [
        overspent
          ? {
              title: "💡 Biggest Overspend",
              body: `${overspent.name} is over budget this period. Review recent transactions in that category.`,
              color: "border-red-500/20 bg-red-500/5",
            }
          : {
              title: "✅ On Track",
              body: "No budget categories are over their limit for the selected period.",
              color: "border-green-500/20 bg-green-500/5",
            },
        {
          title: "📊 Activity",
          body: `${periodRows[0]?.transactions || 0} transactions recorded for this ${period}.`,
          color: "border-blue-500/20 bg-blue-500/5",
        },
        {
          title: "📅 Forecast",
          body: totalBudget
            ? `You have ₹${Math.max(totalBudget - totalSpent, 0).toLocaleString()} left against your saved budgets.`
            : "Create budgets to unlock budget-based forecast insights.",
          color: "border-indigo-500/20 bg-indigo-500/5",
        },
      ],
    },
  });
});
