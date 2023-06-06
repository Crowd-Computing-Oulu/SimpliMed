const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Abstract Schema
const abstractSchema = new Schema(
  {
    // title: {
    //   type: String,
    //   required: [true, "Title is required!"],
    // },
    originalTitle: {
      type: String,
      required: [true, "Title is required!"],
    },
    url: {
      type: String,
      unique: [true, "Url already exists!"],
      lowercase: true,
      trim: true,
      required: [true, "Url not provided!"],
      validate: {
        validator: function (v) {
          return /^[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "{VALUE} is not a valid url!",
      },
    },
    originalAbstract: {
      type: String,
      required: true,
    },
    advancedAbstract: {
      type: String,
      required: true,
    },
    elementaryAbstract: {
      type: String,
      required: true,
    },
    summerizedTitle: {
      type: String,
      required: true,
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "abstracts", //name of the mongoDB collection where the documents will be stored
  }
);

module.exports = mongoose.model("Abstract", abstractSchema);
