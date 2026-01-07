const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const PlatformSchema = new Schema(
  {
    name: {
      es: { type: String, required: true },
      en: { type: String },
    },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = models.Platform || model("Platform", PlatformSchema);
