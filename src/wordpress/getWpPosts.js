const { mysqlConn } = require("../db/mysql");

async function getWpPosts(limit = 999999, offset = 0) {
  const prefix = process.env.WP_PREFIX || "wp_";

  const [rows] = await mysqlConn.execute(
    `
      SELECT 
        ID,
        post_title,
        post_name,
        post_date,
        post_date_gmt,
        post_content,
        post_excerpt,
        post_author
      FROM ${prefix}posts
      WHERE post_type = 'post' AND post_status = 'publish'
      ORDER BY ID ASC
      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

module.exports = { getWpPosts };

