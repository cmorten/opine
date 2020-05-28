import { Request } from "../../types.ts";

/**
 * Check if a request has a request body.
 * A request with a body __must__ either have `transfer-encoding`
 * or `content-length` headers set.
 * 
 * REF: http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.3
 *
 * @param {Request} req
 * @return {boolean}
 * @private
 */
export function hasBody(req: Request): boolean {
  return typeof req.headers.get("transfer-encoding") !== "undefined" ||
    !isNaN(parseInt(req.headers.get("content-length") as string));
}
