const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateSlug(slug: string): string | null {
  if (slug.length < 3 || slug.length > 48) {
    return "Slug must be 3-48 characters.";
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }
  return null;
}
