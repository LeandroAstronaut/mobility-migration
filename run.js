#!/usr/bin/env node
require("dotenv").config();

const { migrateCategories } = require("./src/migrate/migrateCategories");
const { migrateTags } = require("./src/migrate/migrateTags");
const { migrateAuthors } = require("./src/migrate/migrateAuthors");
const { migrateNotes } = require("./src/migrate/migrateNotes");
const { resetCollections } = require("./src/migrate/resetCollections");
const { migrateAdmins } = require("./src/migrate/migrateAdmins");
const { migrateImages } = require("./src/migrate/migrateImages");

const arg = process.argv[2];

async function main() {
  switch (arg) {
    case "authors":
      await migrateAuthors();
      break;

    case "notes":
      await migrateNotes();
      break;

    case "full":
      console.log("🚀 FULL MIGRATION");
      await migrateCategories();
      await migrateTags();
      //await migrateAdmins(); 
      await migrateAuthors(); 
      await migrateNotes();
      break;

    case "reset":
      await resetCollections();
      break;

    case "images":
      await migrateImages();
      break;

    default:
      console.log(`
❓ Comandos:
  node run.js categories
  node run.js tags
  node run.js authors
  node run.js notes
  node run.js full
  node run.js reset
  node run.js images
`);
  }
}

main();
