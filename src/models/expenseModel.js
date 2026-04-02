import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required:[true, "Please Enter the amount"]
  },
  
  description: String,
  
  category: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  note: String,

  recurringExpense: {
    type: Boolean,
    required: true,
  }
},
{
  timestamps: true
})

export default mongoose.model("Expense", expenseSchema);