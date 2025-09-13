const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  passwordStrength: {
    type: String, // e.g. "Weak", "Medium", "Strong"
    required: true,
  },
  breachFound: {
    type: Boolean,
    default: false,
  },
  checkedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", logSchema);
