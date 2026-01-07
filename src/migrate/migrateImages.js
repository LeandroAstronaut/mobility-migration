// src/migrate/migrateImages.js
const { connectMongo } = require("../db/mongo");
const Note = require("../models/Note");
const cloudinary = require("../lib/cloudinary");
const { parse } = require("node-html-parser");

const LIMIT = parseInt(process.env.IMAGES_LIMIT || "20");

async function uploadFromUrl(url, folder, publicId) {
  const res = await cloudinary.uploader.upload(url, {
    folder,
    public_id: publicId,
    overwrite: false,
    resource_type: "image",
  });
  return res.secure_url;
}

async function migrateImages() {
  await connectMongo();

  const notes = await Note.find({
    imageMigrated: false,
  })
    .limit(LIMIT)
    .lean();

  console.log(`🖼️ Migrando imágenes de ${notes.length} notas`);

  for (const note of notes) {
    console.log(`➡ ${note.slug}`);

    let updatedImage = note.image;
    let updatedContent = note.content?.es || "";

    // -------------------------
    // 1️⃣ PORTADA
    // -------------------------
    if (note.image && note.image.startsWith("http")) {
      try {
        updatedImage = await uploadFromUrl(
          note.image,
          `notes/${note.slug}/cover`,
          "cover"
        );
      } catch (err) {
        console.error("❌ Error portada:", err.message);
        continue;
      }
    }

    // -------------------------
    // 2️⃣ IMÁGENES INTERNAS
    // -------------------------
    if (updatedContent.includes("<img")) {
      const root = parse(updatedContent);
      const imgs = root.querySelectorAll("img");

      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        const src = img.getAttribute("src");

        if (!src || !src.startsWith("http")) continue;

        try {
          const cloudUrl = await uploadFromUrl(
            src,
            `notes/${note.slug}/content`,
            `img-${i}`
          );
          img.setAttribute("src", cloudUrl);
        } catch (err) {
          console.error("❌ Error img:", err.message);
        }
      }

      updatedContent = root.toString();
    }

    // -------------------------
    // 3️⃣ GUARDAR
    // -------------------------
    await Note.findByIdAndUpdate(note._id, {
      image: updatedImage,
      content: { es: updatedContent },
      imageMigrated: true,
      contentImagesMigrated: true,
    });

    console.log("   ✔ imágenes migradas");
  }

  console.log("🎉 Migración de imágenes OK");
}

module.exports = { migrateImages };
