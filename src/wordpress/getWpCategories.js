const { mysqlConn } = require("../db/mysql");

async function getWpCategories() {
  const prefix = process.env.WP_PREFIX || "wp_";

  const [rows] = await mysqlConn.execute(
    `
      SELECT t.term_id, t.name, t.slug
      FROM ${prefix}terms t
      JOIN ${prefix}term_taxonomy tt ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'category'
    `
  );

  return rows;
}

module.exports = { getWpCategories };

