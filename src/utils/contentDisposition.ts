import { encodeUrl } from "./encodeUrl.ts";

/**
 * Creates a Content-Disposition Header value from
 * a type and an optional filename.
 * 
 * @param {string} type 
 * @param {string} [filename] 
 * @returns {string}
 * @public
 */
export const contentDisposition = (type: string, filename?: string): string => {
  return `${type}${filename ? `; filename="${encodeUrl(filename)}"` : ""}`;
};
