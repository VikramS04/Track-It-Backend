import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please fill the first name"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Please fill the last name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please fill the email !"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Please add password"],
    select: false
  }
},{
  timestamps: true
});

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
