import { Request } from "../../types.ts";

/**
 * Check if a request has a request body.
 * A request with a body __must__ either have `transfer-encoding`
 * or `content-length` headers set.
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.3
 *
 * @param {Request} request
 * @return {Boolean}
 * @private
 */
export function hasBody(req: Request) {
  return req.headers.get("transfer-encoding") !== undefined ||
    !isNaN(parseInt(req.headers.get("content-length") as string));
}
