import { ServerRequest, Accepts, typeofrequest, isIP } from "../deps.ts";
import { defineGetter } from "./utils/defineGetter.ts";
import { fresh } from "./utils/fresh.ts";
import { parseUrl } from "./utils/parseUrl.ts";
import { Request, Response } from "../src/types.ts";

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
 * @return {string|undefined}
 * @public
 */
request.accepts = function (this: Request, ...args: any[]) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  const accept = new Accepts(this.headers);

  return accept.types.apply(accept, [args])[0];
};

/**
 * Check if the given `charset`s are acceptable,
 * otherwise you should respond with 406 "Not Acceptable".
 *
 * @param {String} ...charset
 * @return {String|undefined}
 * @public
 */
request.acceptsCharsets = function (this: Request, ...args: any[]) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  const accept = new Accepts(this.headers);

  return accept.charsets.apply(accept, [args])[0];
};

/**
 * Check if the given `encoding`s are accepted.
 *
 * @param {String} ...encoding
 * @return {String|undefined}
 * @public
 */

request.acceptsEncodings = function (this: Request, ...args: any[]) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  const accept = new Accepts(this.headers);

  return accept.encodings.apply(accept, [args])[0];
};

/**
 * Check if the given `lang`s are acceptable,
 * otherwise you should respond with 406 "Not Acceptable".
 *
 * @param {String} ...lang
 * @return {String|undefined}
 * @public
 */
request.acceptsLanguages = function (this: Request, ...args: any[]) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  const accept = new Accepts(this.headers);

  return accept.languages.apply(accept, [args])[0];
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

// TODO: req.range()

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

// TODO: trust proxy work.
/**
 * Return the protocol string "http" or "https"
 * when requested with TLS.
 *
 * If you're running behind a reverse proxy that
 * supplies https for you this may be enabled.
 *
 * @return {string}
 * @public
 */
defineGetter(request, "protocol", function protocol(this: Request) {
  const proto = this.proto.includes("https") ? "https" : "http";

  return proto;
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

// TODO: req.ip

// TODO: req.ips

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
  // TODO: trust proxy work
  const host = this.get("Host");

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
