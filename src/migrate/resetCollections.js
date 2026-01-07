// src/migrate/resetCollections.js
const { connectMongo } = require("../db/mongo");

async function resetCollections() {
  await connectMongo();

  const mongoose = require("mongoose");

  console.log("⚠️ Eliminando todas las colecciones…");

  // const collections = ["categories", "tags", "notes", "admins", "platforms"];

  const collections = ["categories", "tags", "notes", "admins"];

  for (const name of collections) {
    try {
      await mongoose.connection.collection(name).deleteMany({});
      console.log(`✔ ${name} vaciada`);
    } catch (err) {
      console.log(`❌ Error vaciando ${name}:`, err.message);
    }
  }

  console.log("🔥 Base limpia!");
}

module.exports = { resetCollections };
