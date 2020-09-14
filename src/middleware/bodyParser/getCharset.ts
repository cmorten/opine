import { charset } from "../../../deps.ts";
import type { Request } from "../../types.ts";

/**
 * Get the charset of a request.
 *
 * @param {Request} req
 * @returns {string|undefined}
 * @private
 */
export function getCharset(req: Request): string | undefined {
  try {
    return (charset(req.headers.get("Content-Type") || "") || "").toLowerCase();
  } catch (e) {
    return undefined;
  }
}
