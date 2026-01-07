const { mysqlConn } = require("../db/mysql");

async function getWpAuthors() {
  const prefix = process.env.WP_PREFIX || "wp_";

  const [rows] = await mysqlConn.execute(
    `
      SELECT 
        ID as wpId,
        user_login,
        user_nicename,
        user_email,
        display_name
      FROM ${prefix}users
    `
  );

  return rows;
}

module.exports = { getWpAuthors };
