const { mysqlConn } = require("../db/mysql");

function fixMysqlUtf8(str) {
  if (!str) return str;

  try {
    return Buffer.from(str, "latin1")
      .toString("utf8")
      .normalize("NFC");
  } catch {
    return str.normalize("NFC");
  }
}

function sanitizeImageUrl(url) {
  if (!url) return url;

  return url
    .normalize("NFC")
    .replace(/[\u0300-\u036f]/g, ""); // elimina combinantes
}

function normalizeImageUrl(url) {
  if (!url) return url;

  const base =
    process.env.WP_UPLOADS_BASE_URL?.replace(/\/$/, "");

  if (!base) return url;

  return url.replace(/https?:\/\/[^/]+/i, base);
}

// 🔑 extrae "file" desde _wp_attachment_metadata (PHP serialized)
function extractFileFromSerializedMeta(serialized) {
  if (!serialized) return null;

  const match = serialized.match(/s:4:"file";s:\d+:"([^"]+)"/);
  return match ? match[1] : null;
}

async function getWpThumbnail(postId) {
  const prefix = process.env.WP_PREFIX || "wp_";
  const BASE_URL =
    process.env.WP_UPLOADS_BASE_URL?.replace(/\/$/, "") || "";

  let imageUrl = null;

  // ======================================================
  // 1️⃣ Intentar por _thumbnail_id (featured image)
  // ======================================================
  const [thumbRows] = await mysqlConn.execute(
    `
    SELECT meta_value
    FROM ${prefix}postmeta
    WHERE post_id = ?
      AND meta_key = '_thumbnail_id'
    `,
    [postId]
  );

  if (thumbRows.length) {
    const attachmentId = thumbRows[0].meta_value;

    // GUID del attachment
    const [guidRows] = await mysqlConn.execute(
      `
      SELECT guid
      FROM ${prefix}posts
      WHERE ID = ?
      `,
      [attachmentId]
    );

    let candidate = guidRows.length
      ? fixMysqlUtf8(guidRows[0].guid)
      : null;

    const isValidGuid =
      candidate &&
      !candidate.includes("?p=") &&
      candidate.match(/\.(jpg|jpeg|png|webp|gif)$/i);

    // _wp_attached_file
    if (!isValidGuid) {
      const [fileRows] = await mysqlConn.execute(
        `
        SELECT meta_value
        FROM ${prefix}postmeta
        WHERE post_id = ?
          AND meta_key = '_wp_attached_file'
        `,
        [attachmentId]
      );

      if (fileRows.length) {
        candidate = `${BASE_URL}/wp-content/uploads/${fixMysqlUtf8(
          fileRows[0].meta_value
        )}`;
      }
    }

    // _wp_attachment_metadata
    if (!candidate || candidate.includes("?p=")) {
      const [metaRows] = await mysqlConn.execute(
        `
        SELECT meta_value
        FROM ${prefix}postmeta
        WHERE post_id = ?
          AND meta_key = '_wp_attachment_metadata'
        `,
        [attachmentId]
      );

      if (metaRows.length) {
        const file = extractFileFromSerializedMeta(
          fixMysqlUtf8(metaRows[0].meta_value)
        );

        if (file) {
          candidate = `${BASE_URL}/wp-content/uploads/${file}`;
        }
      }
    }

    imageUrl = candidate;
  }

  // ======================================================
  // 2️⃣ Fallback: attachment image por post_parent
  // ======================================================
  if (!imageUrl) {
    const [attachmentRows] = await mysqlConn.execute(
      `
      SELECT ID, guid
      FROM ${prefix}posts
      WHERE post_type = 'attachment'
        AND post_parent = ?
        AND post_mime_type LIKE 'image/%'
        AND guid NOT REGEXP '-[0-9]+x[0-9]+\\.'
      ORDER BY ID DESC
      LIMIT 1
      `,
      [postId]
    );

    if (attachmentRows.length) {
      const attachmentId = attachmentRows[0].ID;

      let candidate = fixMysqlUtf8(attachmentRows[0].guid);

      const isValid =
        candidate &&
        !candidate.includes("?p=") &&
        candidate.match(/\.(jpg|jpeg|png|webp|gif)$/i);

      if (!isValid) {
        const [fileRows] = await mysqlConn.execute(
          `
          SELECT meta_value
          FROM ${prefix}postmeta
          WHERE post_id = ?
            AND meta_key = '_wp_attached_file'
          `,
          [attachmentId]
        );

        if (fileRows.length) {
          candidate = `${BASE_URL}/wp-content/uploads/${fixMysqlUtf8(
            fileRows[0].meta_value
          )}`;
        }
      }

      imageUrl = candidate;
    }
  }

  // ======================================================
  // 3️⃣ Normalización final
  // ======================================================
  if (!imageUrl) return null;

  return normalizeImageUrl(sanitizeImageUrl(imageUrl));
}

module.exports = { getWpThumbnail };
