const { migrateCategories } = require("./migrate/migrateCategories");
const { migrateTags } = require("./migrate/migrateTags");
const { migrateNotes } = require("./migrate/migrateNotes");
const { migrateAdmins } = require("./migrate/migrateAdmins");
const { migrateFull } = require("./migrate/migrateFull");

const arg = process.argv[2];

(async () => {
  if (arg === "cats") return migrateCategories();
  if (arg === "tags") return migrateTags();
  if (arg === "admins") return migrateAdmins();
  if (arg === "notes") return migrateNotes();
  if (arg === "full") return migrateFull();

  console.log(`
    Comandos disponibles:

      node run.js cats
      node run.js tags
      node run.js admins
      node run.js notes
      node run.js full   → categorías + tags + autores + notas (append)
  `);
})();
