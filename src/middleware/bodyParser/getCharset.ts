import { charset } from "../../../deps.ts";
import type { OpineRequest } from "../../types.ts";

/**
 * Get the charset of a request.
 *
 * @param {OpineRequest} req
 * @returns {string|undefined}
 * @private
 */
export function getCharset(req: OpineRequest): string | undefined {
  try {
    return (charset(req.headers.get("Content-Type") || "") || "").toLowerCase();
  } catch (_e) {
    return undefined;
  }
}
