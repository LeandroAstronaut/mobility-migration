const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      es: { type: String, required: true },
      en: { type: String },
    },
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = models.Category || model("Category", CategorySchema);
