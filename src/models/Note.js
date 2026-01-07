const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const NoteSchema = new Schema(
  {
    title: { es: String, en: String },
    subtitle: { es: String, en: String },
    content: { es: String, en: String },

    // 🖼️ portada actual (puede ser WP o Cloudinary)
    image: String,

    // 🔙 backup portada WP
    originalImage: String,

    slug: { type: String, unique: true },

    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    platforms: [{ type: Schema.Types.ObjectId, ref: "Platform" }],
    countries: [{ type: Schema.Types.ObjectId, ref: "Country" }],

    author: { type: Schema.Types.ObjectId, ref: "Admin" },

    publishedAt: Date,

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    live: Boolean,
    commentsEnabled: Boolean,

    views: Number,
    shares: Number,
    listens: Number,
    commentsCount: Number,
    favoritesAdded: Number,
    favoritesRemoved: Number,

    // 🧠 FLAGS DE MIGRACIÓN
    imageMigrated: {
      type: Boolean,
      default: false,
    },

    contentImagesMigrated: {
      type: Boolean,
      default: false,
    },

    // 🧾 opcional: backup HTML original
    originalContent: {
      es: String,
      en: String,
    },
  },
  { timestamps: true }
);

module.exports = models.Note || model("Note", NoteSchema);
