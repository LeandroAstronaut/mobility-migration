const { mysqlConn } = require("../db/mysql");

function fixMysqlUtf8(str) {
  if (!str) return str;

  try {
    return Buffer.from(str, "latin1").toString("utf8");
  } catch {
    return str;
  }
}

function normalizeImageUrl(url) {
  if (!url) return url;

  // reemplazo de dominio staging → producción
  return url.replace(
    "portal.helloeveryone.me",
    "mobilityportal.eu"
  );
}

async function getWpThumbnail(postId) {
  const prefix = process.env.WP_PREFIX || "wp_";

  // 1️⃣ Buscar ID de la imagen destacada
  const [rows] = await mysqlConn.execute(
    `
      SELECT pm.meta_value AS thumbnail_id
      FROM ${prefix}postmeta pm
      WHERE pm.post_id = ? AND pm.meta_key = '_thumbnail_id'
    `,
    [postId]
  );

  if (!rows.length) return null;

  const thumbnailId = rows[0].thumbnail_id;

  // 2️⃣ Buscar GUID de la imagen
  const [rows2] = await mysqlConn.execute(
    `
      SELECT guid 
      FROM ${prefix}posts 
      WHERE ID = ?
    `,
    [thumbnailId]
  );

  if (!rows2.length) return null;

  // 🔥 FIX encoding
  let imageUrl = fixMysqlUtf8(rows2[0].guid);

  // 🔁 FIX dominio
  imageUrl = normalizeImageUrl(imageUrl);

  return imageUrl;
}

module.exports = { getWpThumbnail };
