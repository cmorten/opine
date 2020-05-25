/*!
 * Adapted parseUrl for Deno.
 *
 * REF: https://github.com/pillarjs/parseUrl/blob/master/index.js
 *
 * parseUrl
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

import { Request, ParsedURL } from "../types.ts";

/**
 * Parse the `req` url with memoization.
 *
 * @param {Request} req
 * @return {ParsedURL}
 * @public
 */
export function parseUrl(req: Request): ParsedURL | undefined {
  const url = req.url;

  if (url === undefined) {
    // URL is undefined
    return undefined;
  }

  let parsed = req._parsedUrl;

  if (fresh(url, parsed)) {
    // Return cached URL parse
    return parsed;
  }

  // Parse the URL
  parsed = fastParse(url);
  parsed._raw = url;

  return (req._parsedUrl = parsed);
}

/**
 * Parse the `req` original url with fallback and memoization.
 *
 * @param {Request} req
 * @return {Object}
 * @public
 */
export function originalUrl(req: Request): ParsedURL | undefined {
  var url = req.originalUrl;

  if (typeof url !== "string") {
    // Fallback
    return parseUrl(req);
  }

  let parsed = req._parsedOriginalUrl;

  if (fresh(url, parsed)) {
    // Return cached URL parse
    return parsed;
  }

  // Parse the URL
  parsed = fastParse(url);
  parsed._raw = url;

  return (req._parsedOriginalUrl = parsed);
}

/**
 * Parse the `str` url with fast-path short-cut.
 *
 * @param {string} str
 * @return {ParsedURL}
 * @private
 */
function fastParse(str: string): ParsedURL {
  if (typeof str !== "string" || str.charCodeAt(0) !== 0x2f /* / */) {
    try {
      return new URL(str);
    } catch (_) {
      // Gracefully fallback to pattern matching.
    }
  }

  let pathname = str;
  let query = null;
  let search = null;

  // This takes the regexp from https://github.com/joyent/node/pull/7878
  // Which is /^(\/[^?#\s]*)(\?[^#\s]*)?$/
  // And unrolls it into a for loop
  for (var i = 1; i < str.length; i++) {
    switch (str.charCodeAt(i)) {
      case 0x3f:/* ?  */
        if (search === null) {
          pathname = str.substring(0, i);
          query = str.substring(i + 1);
          search = str.substring(i);
        }
        break;
      case 0x09:/* \t */
      case 0x0a:/* \n */
      case 0x0c:/* \f */
      case 0x0d:/* \r */
      case 0x20:/*    */
      case 0x23:/* #  */
      case 0xa0:
      case 0xfeff:
        return new URL(str);
    }
  }

  const url = {} as ParsedURL;

  url.path = str || null;
  (url as any).href = str || null;
  (url as any).pathname = pathname || null;
  (url as any).query = query || null;
  (url as any).search = search || null;
  (url as any).searchParams = new URLSearchParams(search || "");

  return url;
}

/**
 * Determine if parsed is still fresh for url.
 *
 * @param {string} url
 * @param {ParsedURL} parsedUrl
 * @return {boolean}
 * @private
 */
function fresh(url: string, parsedUrl: ParsedURL | undefined): boolean {
  return typeof parsedUrl === "object" &&
    parsedUrl !== null &&
    parsedUrl._raw === url;
}
