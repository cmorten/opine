import { ServerRequest } from "../deps.ts";
import { defineGetter } from "./utils/defineGetter.ts";
import { fresh } from "./utils/fresh.ts";
import { Request, Response } from "../src/types.ts";

/**
 * Request prototype.
 * 
 * @public
 */
export const request: Request = Object.create(ServerRequest.prototype);

/**
 * Return request header.
 *
 * The `Referrer` header field is special-cased,
 * both `Referrer` and `Referer` are interchangeable.
 *
 * Examples:
 *
 *     req.get('Content-Type');
 *     // => "text/plain"
 *
 *     req.get('content-type');
 *     // => "text/plain"
 *
 *     req.get('Something');
 *     // => undefined
 *
 * Aliased as `req.header()`.
 *
 * @param {string} name
 * @return {string}
 * @public
 */
request.get = function get(name: string): string {
  if (!name) {
    throw new TypeError("name argument is required to req.get");
  }

  if (typeof name !== "string") {
    throw new TypeError("name must be a string to req.get");
  }

  const lc = name.toLowerCase();

  switch (lc) {
    case "referer":
    case "referrer":
      return this.headers.get("referrer") ||
        this.headers.get("referer") || "";
    default:
      return this.headers.get(lc) || "";
  }
};

/**
 * Check if the request is fresh, aka
 * Last-Modified and/or the ETag
 * still match.
 *
 * @return {boolean}
 * @public
 */
defineGetter(request, "fresh", function (this: Request): boolean {
  const method = this.method;
  const res = this.res as Response;
  const status = res.status as number;

  // GET or HEAD for weak freshness validation only
  if ("GET" !== method && "HEAD" !== method) {
    return false;
  }

  // 2xx or 304 as per rfc2616 14.26
  if ((status >= 200 && status < 300) || 304 === status) {
    return fresh(Object.fromEntries(this.headers), {
      "etag": res.get("ETag"),
      "last-modified": res.get("Last-Modified"),
    });
  }

  return false;
});
