import Expense from "../models/expenseModel.js";
import asyncHandler from "../utils/asyncHandler.js";

const toExpenseResponse = (expense) => {
  const plain = expense.toObject ? expense.toObject() : expense;

  return {
    ...plain,
    id: plain._id,
    title: plain.description,
    method: plain.paymentMethod,
    recurring: plain.recurringExpense,
  };
};

const buildExpensePayload = (body) => ({
  amount: body.amount,
  description: body.description || body.title,
  category: body.category,
  date: body.date,
  paymentMethod: body.paymentMethod || body.method,
  note: body.note || "",
  recurringExpense: body.recurringExpense ?? body.recurring ?? false,
});

const validateExpensePayload = (payload) => {
  if (!payload.amount || Number(payload.amount) <= 0) {
    return "Please enter a valid amount";
  }

  if (!payload.description || !payload.category || !payload.date || !payload.paymentMethod) {
    return "Please provide amount, description, category, date and payment method";
  }

  if (Number.isNaN(new Date(payload.date).getTime())) {
    return "Please provide a valid date";
  }

  return null;
};

export const getExpenses = asyncHandler(async (req, res) => {
  const { category, search, sortBy = "date", page = 1, limit = 50 } = req.query;
  const query = { user: req.user._id };

  if (category && category !== "All") {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { paymentMethod: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {
    amount: { amount: -1 },
    title: { description: 1 },
    date: { date: -1 },
  };

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .sort(sortOptions[sortBy] || sortOptions.date)
      .skip(skip)
      .limit(pageSize),
    Expense.countDocuments(query),
  ]);

  res.json({
    expenses: expenses.map(toExpenseResponse),
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      limit: pageSize,
    },
  });
});

export const createExpense = asyncHandler(async (req, res) => {
  const payload = buildExpensePayload(req.body);
  const validationError = validateExpensePayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const expense = await Expense.create({
    ...payload,
    user: req.user._id,
  });

  res.status(201).json({ expense: toExpenseResponse(expense) });
});

export const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  res.json({ expense: toExpenseResponse(expense) });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const payload = buildExpensePayload(req.body);
  const validationError = validateExpensePayload(payload);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    payload,
    { new: true, runValidators: true },
  );

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  res.json({ expense: toExpenseResponse(expense) });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  res.json({ id: req.params.id, message: "Expense deleted" });
});

export const deleteExpenses = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error("Please provide expense ids to delete");
  }

  const result = await Expense.deleteMany({
    _id: { $in: ids },
    user: req.user._id,
  });

  res.json({ deletedCount: result.deletedCount });
});

export const getExpenseSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [monthly, weekly, categories, recent] = await Promise.all([
    Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" }, transactions: { $sum: 1 }, biggestSpend: { $max: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: "$date" }, amount: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]),
    Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
    ]),
    Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(5),
  ]);

  const totals = monthly[0] || { totalSpent: 0, transactions: 0, biggestSpend: 0 };

  res.json({
    summary: {
      totalSpent: totals.totalSpent,
      transactions: totals.transactions,
      biggestSpend: totals.biggestSpend,
      weekly,
      categories: categories.map((item) => ({ name: item._id, amount: item.amount })),
      recent: recent.map(toExpenseResponse),
    },
  });
});
