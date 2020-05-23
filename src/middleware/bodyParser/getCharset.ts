import { charset } from "../../../deps.ts";
import { Request } from "../../types.ts";

/**
 * Get the charset of a request.
 *
 * @param {Request} req
 * @private
 */
export function getCharset(req: Request) {
  try {
    return (charset(req.headers.get("Content-Type") || "") || "").toLowerCase();
  } catch (e) {
    return undefined;
  }
}
