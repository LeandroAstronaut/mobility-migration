// src/migrate/migrateTags.js
const { connectMongo } = require("../db/mongo");
const Tag = require("../models/Tag");
const { getWpTags } = require("../wordpress/getWpTags");
const { fixEncoding } = require("../utils/fixEncoding");



async function migrateTags() {
  await connectMongo();

  const tags = await getWpTags();
  console.log(`🏷️ Migrando ${tags.length} tags...`);

  for (const t of tags) {
    await Tag.findOneAndUpdate(
      { slug: t.slug },
      {
        name: { es: fixEncoding(t.name) },
        slug: t.slug,
        active: true,
      },
      { upsert: true }
    );
  }

  console.log("✔ Tags migrados (UPsert)!");
}

module.exports = { migrateTags };
