import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Budget from "../models/budgetModel.js";
import Expense from "../models/expenseModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createAccessToken } from "../utils/token.js";

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    user,
    token: createAccessToken(user._id),
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please provide first name, last name, email and password");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("E-mail already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  sendAuthResponse(res, 201, user);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = await bcrypt.compare(password, user?.password ?? "$2b$10$invalidhashpadding000000000000000000000000000000000000");

if (!user || !passwordMatches) {
  res.status(401);
  throw new Error("Invalid email or password");
}

  sendAuthResponse(res, 200, user);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateCurrentUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    settings,
  } = req.body;

  if (firstName !== undefined) {
    req.user.firstName = firstName;
  }

  if (lastName !== undefined) {
    req.user.lastName = lastName;
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail) {
      res.status(400);
      throw new Error("Email cannot be empty");
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      res.status(400);
      throw new Error("E-mail already registered");
    }

    req.user.email = normalizedEmail;
  }

  if (settings) {
    req.user.settings = {
      ...req.user.settings?.toObject?.(),
      ...settings,
      notifications: {
        ...req.user.settings?.notifications?.toObject?.(),
        ...settings.notifications,
      },
    };
  }

  await req.user.save();

  res.json({ user: req.user });
});

export const exportUserData = asyncHandler(async (req, res) => {
  const [budgets, expenses] = await Promise.all([
    Budget.find({ user: req.user._id }).sort({ createdAt: 1 }),
    Expense.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 }),
  ]);

  res.json({
    export: {
      user: req.user,
      budgets,
      expenses,
      exportedAt: new Date().toISOString(),
    },
  });
});

export const clearUserData = asyncHandler(async (req, res) => {
  await Promise.all([
    Budget.deleteMany({ user: req.user._id }),
    Expense.deleteMany({ user: req.user._id }),
  ]);

  res.json({ message: "All budgets and expenses cleared" });
});

export const deleteCurrentUser = asyncHandler(async (req, res) => {
  await Promise.all([
    Budget.deleteMany({ user: req.user._id }),
    Expense.deleteMany({ user: req.user._id }),
  ]);

  await User.deleteOne({ _id: req.user._id });

  res.json({ message: "Account deleted" });
});
