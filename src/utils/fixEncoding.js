// src/utils/fixEncoding.js
function fixEncoding(text) {
  if (!text || typeof text !== "string") return text;

  let fixed = Buffer.from(text, "latin1").toString("utf8");

  // eliminar basura irrecuperable
  fixed = fixed
    .replace(/\uFFFD/g, "")   // �
    .replace(/⬝/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return fixed;
}

module.exports = { fixEncoding };
