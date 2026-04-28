import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema({
  budget: {
    type: Boolean,
    default: true,
  },
  weekly: {
    type: Boolean,
    default: true,
  },
  tips: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const userSettingsSchema = new mongoose.Schema({
  currency: {
    type: String,
    default: "INR",
    trim: true,
  },
  darkMode: {
    type: Boolean,
    default: true,
  },
  monthStartDay: {
    type: String,
    default: "1st",
    trim: true,
  },
  defaultView: {
    type: String,
    default: "dashboard",
    trim: true,
  },
  notifications: {
    type: notificationSettingsSchema,
    default: () => ({}),
  },
}, { _id: false });

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
  },
  settings: {
    type: userSettingsSchema,
    default: () => ({}),
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
