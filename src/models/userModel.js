import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true,"Please fill the first name"]
  },
  lastName: {
    type: String,
    required: [true,"Please fill the last name"]
  },
  email: {
    type: String,
    required: [true, "Please fill the email !"],
    unique: [true, "E-mail already registered"]
  },
  password: {
    type: String,
    required: [true, "Please add password"]
  }
},{
  timestamps: true
});

export default mongoose.model("User", userSchema);