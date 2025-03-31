/**
 * Utility functions for the blog module
 */

/**
 * Generate a URL-friendly slug from a string
 * @param str The string to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim() // Trim leading/trailing spaces
    .replace(/^-+/, '') // Trim leading hyphens
    .replace(/-+$/, ''); // Trim trailing hyphens
};

/**
 * Ensure a slug is unique by appending a number if necessary
 * @param baseSlug The original slug
 * @param existingSlugs An array of existing slugs to check against
 * @returns A unique slug
 */
export const ensureUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Extracts an excerpt from HTML content
 * @param content HTML content
 * @param length Maximum length for the excerpt
 * @returns Plain text excerpt
 */
export const extractExcerpt = (content: string, length = 160): string => {
  // Simple HTML tag removal - for production, use a proper HTML parsing library
  const plainText = content
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/\s+/g, ' ') // Consolidate whitespace
    .trim(); // Trim leading/trailing spaces

  return plainText.length > length
    ? `${plainText.substring(0, length)}...`
    : plainText;
}; 