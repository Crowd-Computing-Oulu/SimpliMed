const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
var userSchema = new Schema(
  {
    name: {
      type: String,
      required: [false, "Name is required!"],
    },
    username: {
      type: String,
      unique: [true, "username already exists!"],
      lowercase: true,
      trim: true,
      required: [true, "username not provided!"],
    },
    // email: {
    //   type: String,
    //   unique: [true, "Email already exists!"],
    //   lowercase: true,
    //   trim: true,
    //   required: [false, "Email not provided!"],
    //   validate: {
    //     validator: function (v) {
    //       return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    //     },
    //     message: "{VALUE} is not a valid email!",
    //   },
    // },
    role: {
      type: String,
      enum: ["tester", "admin"],
      required: [false, "Please specify a user role"],
    },
    password: {
      type: String,
      required: false,
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);
