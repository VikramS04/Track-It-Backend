import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },

  amount: {
    type: Number,
    required: [true, "Please Enter the amount"],
    min: [0, "Amount must be positive"],
  },
  
  description: {
    type: String,
    required: [true, "Please add a description"],
    trim: true,
  },
  
  category: {
    type: String,
    required: true,
    trim: true,
  },

  date: {
    type: Date,
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
    trim: true,
  },

  note: {
    type: String,
    trim: true,
    default: "",
  },

  recurringExpense: {
    type: Boolean,
    default: false,
  }
},
{
  timestamps: true
})

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

export default mongoose.model("Expense", expenseSchema);
