import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./db/dbConnection.js";
import errorHandler from "./middlewares/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "TrackIt API running" });
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
