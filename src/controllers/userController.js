import bcrypt from "bcrypt";
import User from "../models/userModel.js";
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
