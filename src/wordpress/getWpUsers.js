const { mysqlConn } = require("../db/mysql");

async function getWpUsers() {
  const [rows] = await mysqlConn.execute(`
    SELECT 
      ID,
      user_login,
      user_email,
      display_name
    FROM wp_users
  `);

  return rows;
}

module.exports = { getWpUsers };
