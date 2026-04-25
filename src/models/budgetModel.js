import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  name: {
    type: String,
    required: [true, "Please add a budget name"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Please add a budget category"],
    trim: true,
  },
  total: {
    type: Number,
    required: [true, "Please add a budget amount"],
    min: [0, "Budget amount must be positive"],
  },
  icon: {
    type: String,
    default: "📦",
  },
  color: {
    type: String,
    default: "bg-blue-500",
  },
  colorHex: {
    type: String,
    default: "#3b82f6",
  },
}, {
  timestamps: true,
});

budgetSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
