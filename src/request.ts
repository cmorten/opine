import {
  Accepts,
  isIP,
  parseRange,
  ServerRequest,
  typeofrequest,
} from "../deps.ts";
import { defineGetter } from "./utils/defineGetter.ts";
import { fresh } from "./utils/fresh.ts";
import { parseUrl } from "./utils/parseUrl.ts";
import { all, proxyaddr } from "./utils/proxyAddr.ts";
import type {
  RangeParserOptions,
  RangeParserRanges,
  RangeParserResult,
  Request,
  Response,
} from "../src/types.ts";

/**
 * Request prototype.
 * 
 * @public
 */
export const request: Request = Object.create(ServerRequest.prototype);

/**
 * Check if the given `type(s)` is acceptable, returning
 * the best match when true, otherwise `undefined`, in which
 * case you should respond with 406 "Not Acceptable".
 *
 * The `type` value may be a single MIME type string
 * such as "application/json", an extension name
 * such as "json", a comma-delimited list such as "json, html, text/plain",
 * an argument list such as `"json", "html", "text/plain"`,
 * or an array `["json", "html", "text/plain"]`. When a list
 * or array is given, the _best_ match, if any is returned.
 *
 * Examples:
 *
 *     // Accept: text/html
 *     req.accepts('html');
 *     // => "html"
 *
 *     // Accept: text/*, application/json
 *     req.accepts('html');
 *     // => "html"
 *     req.accepts('text/html');
 *     // => "text/html"
 *     req.accepts('json, text');
 *     // => "json"
 *     req.accepts('application/json');
 *     // => "application/json"
 *
 *     // Accept: text/*, application/json
 *     req.accepts('image/png');
 *     req.accepts('png');
 *     // => undefined
 *
 *     // Accept: text/*;q=.5, application/json
 *     req.accepts(['html', 'json']);
 *     req.accepts('html', 'json');
 *     req.accepts('html, json');
 *     // => "json"
 *
 * @param {string|string[]} type
 * @return {string|string[]|false}
 * @public
 */
request.accepts = function (this: Request, ...args: [string[]] | string[]) {
  const accept = new Accepts(this.headers);

  return accept.types.call(accept, args.flat(1));
};

/**
 * Check if the given `charset`s are acceptable,
 * otherwise you should respond with 406 "Not Acceptable".
 *
 * @param {string|string[]} ...charset
 * @return {string|string[]|false}
 * @public
 */
request.acceptsCharsets = function (
  this: Request,
  ...args: [string[]] | string[]
) {
  const accept = new Accepts(this.headers);

  return accept.charsets.call(accept, args.flat(1));
};

/**
 * Check if the given `encoding`s are accepted.
 *
 * @param {string|string[]} ...encoding
 * @return {string|string[]|false}
 * @public
 */

request.acceptsEncodings = function (
  this: Request,
  ...args: [string[]] | string[]
) {
  const accept = new Accepts(this.headers);

  return accept.encodings.call(accept, args.flat(1));
};

/**
 * Check if the given `lang`s are acceptable,
 * otherwise you should respond with 406 "Not Acceptable".
 *
 * @param {string|string[]} ...lang
 * @return {string|string[]|false}
 * @public
 */
request.acceptsLanguages = function (
  this: Request,
  ...args: [string[]] | string[]
) {
  const accept = new Accepts(this.headers);

  return accept.languages.call(accept, args.flat(1));
};

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
request.get = function get(name: string): string | undefined {
  const lc = name.toLowerCase();

  switch (lc) {
    case "referer":
    case "referrer":
      return this.headers.get("referrer") ||
        this.headers.get("referer") || undefined;
    default:
      return this.headers.get(lc) || undefined;
  }
};

/**
 * Parse Range header field, capping to the given `size`.
 *
 * Unspecified ranges such as "0-" require knowledge of your resource length. In
 * the case of a byte range this is of course the total number of bytes. If the
 * Range header field is not given `undefined` is returned, `-1` when unsatisfiable,
 * and `-2` when syntactically invalid.
 *
 * When ranges are returned, the array has a "type" property which is the type of
 * range that is required (most commonly, "bytes"). Each array element is an object
 * with a "start" and "end" property for the portion of the range.
 *
 * The "combine" option can be set to `true` and overlapping & adjacent ranges
 * will be combined into a single range.
 *
 * NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
 * should respond with 4 users when available, not 3.
 *
 * @param {number} size
 * @param {object} [options]
 * @param {boolean} [options.combine=false]
 * @return {number|number[]|undefined}
 * @public
 */
request.range = function range(
  size: number,
  options?: RangeParserOptions,
): RangeParserRanges | RangeParserResult | undefined {
  const range = this.get("Range");

  if (!range) return;

  return parseRange(size, range, options) as
    | RangeParserRanges
    | RangeParserResult;
};

/**
 * Check if the incoming request contains the "Content-Type"
 * header field, and it contains the give mime `type`.
 *
 * Examples:
 *
 *      // With Content-Type: text/html; charset=utf-8
 *      req.is('html');
 *      req.is('text/html');
 *      req.is('text/*');
 *      // => true
 *
 *      // When Content-Type is application/json
 *      req.is('json');
 *      req.is('application/json');
 *      req.is('application/*');
 *      // => true
 *
 *      req.is('html');
 *      // => false
 *
 * @param {String|Array} types...
 * @return {String|false|null}
 * @public
 */
request.is = function is(this: Request, types: string | string[]) {
  let arr = types;

  // support flattened arguments
  if (!Array.isArray(types)) {
    arr = new Array(arguments.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arguments[i];
    }
  }

  return typeofrequest(this.headers, arr as string[]);
};

/**
 * Return the protocol string "http" or "https"
 * when requested with TLS. When the "trust proxy"
 * setting trusts the socket address, the
 * "X-Forwarded-Proto" header field will be trusted
 * and used if present.
 *
 * If you're running behind a reverse proxy that
 * supplies https for you this may be enabled.
 *
 * @return {string}
 * @public
 */
defineGetter(request, "protocol", function protocol(this: Request) {
  const proto = this.proto.includes("https") ? "https" : "http";
  const trust = this.app.get("trust proxy fn");
  const { hostname: remoteAddress } = this.conn.remoteAddr as Deno.NetAddr;

  if (!trust(remoteAddress, 0)) {
    return proto;
  }

  // Note: X-Forwarded-Proto is normally only ever a
  // single value, but this is to be safe.
  const header = this.get("X-Forwarded-Proto") ?? proto;
  const index = header.indexOf(",");

  return index !== -1 ? header.substring(0, index).trim() : header.trim();
});

/**
 * Short-hand for:
 *
 *    req.protocol === 'https'
 *
 * @return {Boolean}
 * @public
 */
defineGetter(request, "secure", function secure(this: Request) {
  return this.protocol === "https";
});

/**
 * Return the remote address from the trusted proxy.
 *
 * The is the remote address on the socket unless
 * "trust proxy" is set.
 *
 * @return {String}
 * @public
 */

defineGetter(request, "ip", function ip(this: Request) {
  const trust = this.app.get("trust proxy fn");

  return proxyaddr(this, trust);
});

/**
 * When "trust proxy" is set, trusted proxy addresses + client.
 *
 * For example if the value were "client, proxy1, proxy2"
 * you would receive the array `["client", "proxy1", "proxy2"]`
 * where "proxy2" is the furthest down-stream and "proxy1" and
 * "proxy2" were trusted.
 *
 * @return {Array}
 * @public
 */
defineGetter(request, "ips", function ips(this: Request) {
  const trust = this.app.get("trust proxy fn");
  const addrs = all(this, trust);

  // Reverse the order (to farthest -> closest)
  // and remove socket address
  addrs.reverse().pop();

  return addrs;
});

/**
 * Return subdomains as an array.
 *
 * Subdomains are the dot-separated parts of the host before the main domain of
 * the app. By default, the domain of the app is assumed to be the last two
 * parts of the host. This can be changed by setting "subdomain offset".
 *
 * For example, if the domain is "deno.dinosaurs.example.com":
 * If "subdomain offset" is not set, req.subdomains is `["dinosaurs", "deno"]`.
 * If "subdomain offset" is 3, req.subdomains is `["deno"]`.
 *
 * @return {Array}
 * @public
 */
defineGetter(request, "subdomains", function subdomains(this: Request) {
  const hostname = this.hostname;

  if (!hostname) return [];

  const offset = this.app.get("subdomain offset");
  const subdomains = !isIP(hostname)
    ? hostname.split(".").reverse()
    : [hostname];

  return subdomains.slice(offset);
});

/**
 * Returns the pathname of the URL.
 *
 * @return {String}
 * @public
 */
defineGetter(request, "path", function path(this: Request) {
  return (parseUrl(this) || {}).pathname;
});

/**
 * Parse the "Host" header field to a hostname.
 *
 * When the "trust proxy" setting trusts the socket
 * address, the "X-Forwarded-Host" header field will
 * be trusted.
 *
 * @return {String}
 * @public
 */
defineGetter(request, "hostname", function hostname(this: Request) {
  const trust = this.app.get("trust proxy fn");
  let host = this.get("X-Forwarded-Host");
  const { hostname: remoteAddress } = this.conn.remoteAddr as Deno.NetAddr;

  if (!host || !trust(remoteAddress, 0)) {
    host = this.get("Host");
  } else if (host.indexOf(",") !== -1) {
    // Note: X-Forwarded-Host is normally only ever a
    // single value, but this is to be safe.
    host = host.substring(0, host.indexOf(",")).trimRight();
  }

  if (!host) return;

  // IPv6 literal support
  const offset = host[0] === "[" ? host.indexOf("]") + 1 : 0;
  const index = host.indexOf(":", offset);

  return index !== -1 ? host.substring(0, index) : host;
});

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
    return fresh(Object.fromEntries(this.headers as any), {
      "etag": res.get("ETag"),
      "last-modified": res.get("Last-Modified"),
    });
  }

  return false;
});

/**
 * Check if the request is stale, aka
 * "Last-Modified" and / or the "ETag" for the
 * resource has changed.
 *
 * @return {Boolean}
 * @public
 */
defineGetter(request, "stale", function stale(this: Request): boolean {
  return !this.fresh;
});

/**
 * Check if the request was an _XMLHttpRequest_.
 *
 * @return {Boolean}
 * @public
 */
defineGetter(request, "xhr", function xhr(this: Request) {
  const val = this.get("X-Requested-With") || "";

  return val.toLowerCase() === "xmlhttprequest";
});
