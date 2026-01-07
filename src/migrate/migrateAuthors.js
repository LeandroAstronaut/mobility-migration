// src/migrate/migrateAuthors.js
const { connectMongo } = require("../db/mongo");
const Admin = require("../models/Admin");
const { getWpAuthors } = require("../wordpress/getWpAuthors");
const bcrypt = require("bcryptjs");
const { fixEncoding } = require("../utils/fixEncoding");

async function migrateAuthors() {
  await connectMongo();

  const authors = await getWpAuthors();
  console.log(`✍️ Migrando ${authors.length} AUTHORS...`);

  const HASHED_PASSWORD = bcrypt.hashSync("MP2026", 10);

  for (const a of authors) {
    const name = fixEncoding(
      a.display_name || a.user_nicename || a.user_login || "Autor"
    ).trim();

    const emailRaw = fixEncoding(a.user_email || `autor${a.wpId}@example.com`);
    const email = (emailRaw || "").trim().toLowerCase();

    // ✅ CLAVE: upsert por EMAIL (no por wpId)
    await Admin.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          status: "active",
          roles: ["Admin"],
          permissions: {
            createNotes: true,
            editOwnNotes: true,
          },
        },

        // solo setea password si el doc se crea ahora
        $setOnInsert: {
          password: HASHED_PASSWORD,
          wpId: a.wpId,
        },

        // si ya existe y no tiene wpId, lo completamos
        $set: {
          name,
          email,
          image: "https://res.cloudinary.com/dko416edr/image/upload/v1767790358/customer/avatar-user-new.avif",
          status: "inactive",
          roles: ["Admin"],
          permissions: {
            editLayoutNotes: false,
            editLayoutAds: false,

            createNotes: false,
            editAllNotes: false,
            editOwnNotes: false,
            publishNotes: false,
            viewNotesStats: false,

            editAds: false,
            publishAds: false,
            viewAdsStats: false,

            editSponsors: false,
            publishSponsors: false,
            viewSponsorsStats: false,

            editProducts: false,
            publishProducts: false,

            editEvents: false,
            publishEvents: false,

            editUsers: false, 
          },
        },
      },
      { upsert: true }
    );
  }

  console.log("✔ Authors migrados correctamente");
}

module.exports = { migrateAuthors };
