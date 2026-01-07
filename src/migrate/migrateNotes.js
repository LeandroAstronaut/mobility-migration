// src/migrate/migrateNotes.js
const { connectMongo } = require("../db/mongo");
const Note = require("../models/Note");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Admin = require("../models/Admin");
const Platform = require("../models/Platform");

const { cleanHtml } = require("../utils/cleanHtml");
const { fixEncoding } = require("../utils/fixEncoding");

const { getWpPosts } = require("../wordpress/getWpPosts");
const { getWpThumbnail } = require("../wordpress/getWpThumbnail");
const { getWpPostTerms } = require("../wordpress/getWpPostTerms");

async function migrateNotes() {
  await connectMongo();

  // -----------------------------
  // PLATFORM
  // -----------------------------
  const platformSlug = process.env.PLATFORM_SLUG;
  const platformNameEs = process.env.PLATFORM_NAME_ES;
  const platformNameEn = process.env.PLATFORM_NAME_EN;

  let platform = await Platform.findOne({ slug: platformSlug });
  if (!platform) {
    platform = await Platform.create({
      slug: platformSlug,
      name: { es: platformNameEs, en: platformNameEn },
    });
  }

  const LIMIT = parseInt(process.env.WP_POSTS_LIMIT || "999999");
  const OFFSET = parseInt(process.env.WP_POSTS_OFFSET || "0");

  const posts = await getWpPosts(LIMIT, OFFSET);
  console.log(`📝 Migrando ${posts.length} notas para ${platformSlug}...`);

  for (const post of posts) {
    const title = fixEncoding(post.post_title || "");
    console.log(`➡ ${title}`);

    const author = await Admin.findOne({ wpId: post.post_author }).lean();

    const terms = await getWpPostTerms(post.ID);
    const cats = terms.filter((t) => t.taxonomy === "category");
    const tagList = terms.filter((t) => t.taxonomy === "post_tag");

    const hasSpainCategory = cats.some(
      (c) => c.slug === "mobility-portal-spain"
    );

    // -----------------------------
    // FILTRO SEGÚN PLATAFORMA
    // -----------------------------
    if (platformSlug === "europe" && hasSpainCategory) {
      console.log("   ⏭ omitida (Spain en Europe)");
      continue;
    }

    if (platformSlug === "spain" && !hasSpainCategory) {
      console.log("   ⏭ omitida (no Spain)");
      continue;
    }

    // -----------------------------
    // IDIOMA DESTINO
    // -----------------------------
    let targetLang = "es";

    if (platformSlug === "europe") targetLang = "en";
    if (platformSlug === "latam") targetLang = "es";
    if (platformSlug === "spain") targetLang = "es";

    const catDocs = await Category.find({
      slug: { $in: cats.map((c) => c.slug) },
    }).lean();

    const tagDocs = await Tag.find({
      slug: { $in: tagList.map((t) => t.slug) },
    }).lean();

    const image = await getWpThumbnail(post.ID);

    const rawContent = fixEncoding(post.post_content || "");
    const content = cleanHtml(rawContent);
    const rawExcerpt = fixEncoding(post.post_excerpt || "");

    const publishedAt = post.post_date || post.post_date_gmt;

    // -----------------------------
    // CAMPOS MULTIIDIOMA
    // -----------------------------
    const titleField = {};
    const subtitleField = {};
    const contentField = {};
    const originalContentField = {};

    titleField[targetLang] = title;
    subtitleField[targetLang] = rawExcerpt;
    contentField[targetLang] = content;
    originalContentField[targetLang] = rawContent;

    await Note.findOneAndUpdate(
      { slug: post.post_name },
      {
        title: titleField,
        subtitle: subtitleField,
        content: contentField,

        originalContent: originalContentField,

        image: image || undefined,
        originalImage: image || undefined,

        imageMigrated: false,
        contentImagesMigrated: false,

        categories: catDocs.map((c) => c._id),
        tags: tagDocs.map((t) => t._id),
        platforms: [platform._id],

        author: author?._id || null,
        publishedAt,

        status: "active",
        commentsEnabled: false,
      },
      { upsert: true }
    );

    console.log(`   ✔ nota migrada (${targetLang.toUpperCase()})`);
  }

  console.log("🎉 Migración de notas lista.");
}

module.exports = { migrateNotes };
