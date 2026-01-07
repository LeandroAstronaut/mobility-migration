const sanitize = require("sanitize-html");

function cleanHtml(html) {
  if (!html) return "";

  // 1️⃣ Normalizar saltos
  html = html
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // 2️⃣ Quitar shortcodes WP
  html = html.replace(/\[.*?]/g, "");

  // 3️⃣ Si NO hay <p>, vamos a construir párrafos
  const hasParagraphs = /<p[\s>]/i.test(html);

  let blocks = [];

  if (hasParagraphs) {
    // 👉 Ya viene con <p>, solo normalizamos <br>
    html = html
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "</p><p>")
      .replace(/<br\s*\/?>/gi, "</p><p>");

    blocks = html
      .replace(/<\/?span[^>]*>/g, "")
      .split(/<\/p>\s*<p>/i)
      .map(p => p.replace(/<\/?p>/gi, "").trim())
      .filter(Boolean);
  } else {
    // 👉 Texto plano o con <br>
    html = html
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n\n");

    blocks = html
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(Boolean);
  }

  // 4️⃣ Fallback final: frases largas sin saltos
  if (blocks.length === 1) {
    blocks = blocks[0]
      .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])/)
      .map(p => p.trim())
      .filter(Boolean);
  }

  // 5️⃣ Envolver en <p>
  const wrapped = blocks.map(p => `<p>${p}</p>`).join("");

  // 6️⃣ Sanitizar
  return sanitize(wrapped, {
    allowedTags: [
      "p",
      "strong",
      "b",
      "em",
      "i",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img"
    ],
    allowedAttributes: {
      a: ["href", "target", "title"],
      img: ["src", "alt"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard"
  });
}

module.exports = { cleanHtml };
