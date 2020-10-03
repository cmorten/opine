/*!
 * Port of parseUrl (https://github.com/pillarjs/parseUrl) for Deno.
 *
 * Licensed as follows:
 *
 * (The MIT License)
 * 
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2014-2017 Douglas Christopher Wilson <doug@somethingdoug.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

import type { ParsedURL, Request } from "../types.ts";

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
  const url = req.originalUrl;

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
  for (let i = 1; i < str.length; i++) {
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
