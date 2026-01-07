// src/utils/normalizeText.js
function normalizeText(text) {
  if (!text || typeof text !== "string") return text;

  return text
    // caracter de reemplazo unicode
    .replace(/\uFFFD/g, "")

    // símbolos basura conocidos
    .replace(/⬝/g, "")

    // comillas tipográficas → normales (solo las que EXISTEN)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

    // guiones largos
    .replace(/[–—]/g, "-")

    // 🔥 CLAVE: eliminar S fantasma antes de palabra SI hay comilla de cierre después
    .replace(/\bS([a-záéíóúñ]+)"/gi, '$1"')

    // espacios múltiples
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { normalizeText };
