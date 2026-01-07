const mysql = require("mysql2/promise");

const mysqlConn = mysql.createPool({
  host: process.env.WP_DB_HOST || "localhost",
  user: process.env.WP_DB_USER || "root",
  password: process.env.WP_DB_PASS || "",
  database: process.env.WP_DB_NAME,        // 👈 cambia según .env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

module.exports = { mysqlConn };

