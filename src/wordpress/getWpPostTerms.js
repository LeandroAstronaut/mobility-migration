const { mysqlConn } = require("../db/mysql");

async function getWpPostTerms(postId) {
  const prefix = process.env.WP_PREFIX || "wp_";

  const [rows] = await mysqlConn.execute(
    `
      SELECT t.slug, t.name, tt.taxonomy
      FROM ${prefix}terms t
      JOIN ${prefix}term_taxonomy tt ON t.term_id = tt.term_id
      JOIN ${prefix}term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tr.object_id = ?
    `,
    [postId]
  );

  return rows;
}

module.exports = { getWpPostTerms };

