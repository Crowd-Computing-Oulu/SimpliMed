const mongoose = require("mongoose");
const userSchema = new mongoose.schema({
  url: {
    type: stringify,
    required: false,
  },
});
