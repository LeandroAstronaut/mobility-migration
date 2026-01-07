// src/migrate/migrateAdmins.js
const { connectMongo } = require("../db/mongo");
const Admin = require("../models/Admin");
const { getWpUsers } = require("../wordpress/getWpUsers");
const { fixEncoding } = require("../utils/fixEncoding");



async function migrateAdmins() {
  await connectMongo();

  const wpUsers = await getWpUsers();
  console.log(`👤 Migrando ${wpUsers.length} ADMINs de WordPress...`);

  for (const u of wpUsers) {
    const name = fixEncoding(u.display_name || u.user_login);
    const email = fixEncoding(u.user_email || `${u.user_login}@example.com`);

    await Admin.findOneAndUpdate(
      { wpId: u.ID },
      {
        wpId: u.ID,
        name,
        email,
        roles: ["Admin"],
        status: "active", 

        permissions: {
          editLayoutNotes: true,
          editLayoutAds: true,

          createNotes: true,
          editAllNotes: true,
          editOwnNotes: true,
          publishNotes: true,
          viewNotesStats: true,

          editAds: true,
          publishAds: true,
          viewAdsStats: true,

          editSponsors: true,
          publishSponsors: true,
          viewSponsorsStats: true,

          editProducts: true,
          publishProducts: true,

          editEvents: true,
          publishEvents: true,

          editUsers: false, // ⛔ único en false
        },
      },
      { upsert: true }
    );
  }

  console.log("✔ Admins migrados correctamente");
}

module.exports = { migrateAdmins };
