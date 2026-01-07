// src/models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema, model, models } = mongoose;

const adminSchema = new Schema(
  {
    wpId: { type: Number, index: true },

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    image: { type: String},

    password: {
      type: String,
      required: true,
      default: bcrypt.hashSync("MP2026", 10),
    },

    roles: {
      type: [String],
      enum: ["Admin"],
      default: ["Admin"],
    },

    permissions: {
      editLayoutNotes: { type: Boolean, default: false },
      editLayoutAds: { type: Boolean, default: false },

      createNotes: { type: Boolean, default: false },
      editAllNotes: { type: Boolean, default: false },
      editOwnNotes: { type: Boolean, default: false },
      publishNotes: { type: Boolean, default: false },
      viewNotesStats: { type: Boolean, default: false },

      editAds: { type: Boolean, default: false },
      publishAds: { type: Boolean, default: false },
      viewAdsStats: { type: Boolean, default: false },

      editSponsors: { type: Boolean, default: false },
      publishSponsors: { type: Boolean, default: false },
      viewSponsorsStats: { type: Boolean, default: false },

      editProducts: { type: Boolean, default: false },
      publishProducts: { type: Boolean, default: false },

      editEvents: { type: Boolean, default: false },
      publishEvents: { type: Boolean, default: false },

      editUsers: { type: Boolean, default: false },
    },



    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  { timestamps: true }
);

module.exports = models.Admin || model("Admin", adminSchema);
