const mongoose = require("mongoose");
const abstractSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  originalAbstract: {
    type: String,
    required: true,
  },
  elementryAbstract: {
    type: String,
    required: true,
  },
  advancedAbstract: {
    type: String,
    required: true,
  },
  generatedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
module.exports = mongoose.model("Abstract", abstractSchema);
