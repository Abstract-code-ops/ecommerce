import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: "user" },
    address: {
      fullName: { type: String },
      street: { type: String },
      city: { type: String },
      emirate: { type: String },
      country: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
