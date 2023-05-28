var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// User Schema
var userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
  },
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    lowercase: true,
    trim: true,
    required: [true, "Email not provided!"],
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "{VALUE} is not a valid email!",
    },
  },
  role: {
    type: String,
    enum: ["tester", "admin"],
    required: [true, "Please specify a user role"],
  },
  password: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
