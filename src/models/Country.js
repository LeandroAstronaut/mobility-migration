const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const CountrySchema = new Schema({
  name: {
    es: { type: String, required: true },
    en: { type: String, required: true },
  },
  slug: { type: String, required: true, unique: true },
});

module.exports = models.Country || model("Country", CountrySchema);
