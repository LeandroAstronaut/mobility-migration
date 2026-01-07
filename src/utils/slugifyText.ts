import slugify from "slugify";

export function slugifyText(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "es",
  });
}
