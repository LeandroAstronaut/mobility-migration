const { connectMongo } = require("../db/mongo");
const Category = require("../models/Category");
const { getWpCategories } = require("../wordpress/getWpCategories");
const { fixEncoding } = require("../utils/fixEncoding");



async function migrateCategories() {
  await connectMongo();

  const wpCats = await getWpCategories();
  console.log(`📁 Migrando ${wpCats.length} categorías...`);

  for (const cat of wpCats) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        name: { es: fixEncoding(cat.name) },
        slug: cat.slug,
        active: true,
      },
      { upsert: true }
    );
  }

  console.log("✔ Categorías migradas (UPsert)!");
}

module.exports = { migrateCategories };
