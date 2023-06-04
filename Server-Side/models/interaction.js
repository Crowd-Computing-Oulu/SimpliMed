var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// Interaction Schema
var interactioSchema = new Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId, //userSchema,
      ref: "User",
      required: [true, "user is required!"],
    },
    abstractID: {
      type: mongoose.Schema.Types.ObjectId, //abstractSchema,
      ref: "Abstract",
      required: [true, "abstract is required!"],
    },
    originalTime: {
      type: String,
      required: false,
    },
    advancedTime: {
      type: String,
      required: false,
    },
    elementaryTime: {
      type: String,
      required: false,
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "interactions",
  }
);

module.exports = mongoose.model("Interaction", interactioSchema);
