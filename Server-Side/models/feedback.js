const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Abstract Schema
const onBoardingQuestionnaireSchema = new Schema({
  multipleChoice: {
    type: String,
    required: [true, "multipleChoice is  required!"],
  },
  Q1Text: {
    type: String,
    required: [true, "Q1Text 1 is required!"],
  },
  Q2Text: {
    type: String,
    required: false,
  },
  Q3Text: {
    type: String,
    required: false,
  },
  // Q4Text: {
  //   type: String,
  //   required: [true, "Q4Text 4 is required!"],
  // },
});
const feedbackSchema = new Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId, //userSchema,
      ref: "User",
      required: [true, "user id is required!"],
    },
    interactionID: {
      type: mongoose.Schema.Types.ObjectId, //interactionSchema,
      ref: "Interaction",
      required: [true, "Interaction id is required!"],
    },
    abstractID: {
      type: mongoose.Schema.Types.ObjectId, //interactionSchema,
      ref: "Abstract",
      required: [true, "Abstract id is required!"],
    },
    originalDifficulty: {
      type: Number,
      required: [true, "Original Value is required!"],
    },
    advancedDifficulty: {
      type: Number,
      required: [true, "Advanced Value is required!"],
    },
    elementaryDifficulty: {
      type: Number,
      required: [true, "Elementary Value is required!"],
    },
    // text: {
    //   type: String,
    //   required: [true, "Text is required!"],
    // },
    onBoardingQuestionnaire: {
      type: onBoardingQuestionnaireSchema, // Using the separate onBoardingQuestionnaire here
      required: [true, "onBoardingQuestionnaire is required!"],
    },
    created: {
      type: Date,
      default: Date.now,
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
  },
  {
    collection: "feedbacks", //name of the mongoDB collection where the documents will be stored
  }
);

module.exports = mongoose.model("feedbacks", feedbackSchema);
