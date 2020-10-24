/*!
 * Port of fresh (https://github.com/jshttp/fresh) for Deno.
 *
 * Licensed as follows:
 *
 * (The MIT License)
 * 
 * Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright (c) 2016-2017 Douglas Christopher Wilson <doug@somethingdoug.com>
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

const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/;

/**
 * Check freshness of the response using request and response headers.
 *
 * @param {object} reqHeaders
 * @param {object} resHeaders
 * @return {boolean}
 * @public
 */
export function fresh(reqHeaders: any, resHeaders: any): boolean {
  const modifiedSince = reqHeaders["if-modified-since"];
  const noneMatch = reqHeaders["if-none-match"];

  // unconditional request
  if (!modifiedSince && !noneMatch) {
    return false;
  }

  // Always return stale when Cache-Control: no-cache
  // to support end-to-end reload requests
  // https://tools.ietf.org/html/rfc2616#section-14.9.4
  const cacheControl = reqHeaders["cache-control"];
  if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) {
    return false;
  }

  // if-none-match
  if (noneMatch && noneMatch !== "*") {
    const etag = resHeaders["etag"];

    if (!etag) {
      return false;
    }

    let etagStale = true;
    const matches = parseTokenList(noneMatch);
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (match === etag || match === "W/" + etag || "W/" + match === etag) {
        etagStale = false;
        break;
      }
    }

    if (etagStale) {
      return false;
    }
  }

  // if-modified-since
  if (modifiedSince) {
    const lastModified = resHeaders["last-modified"];
    const modifiedStale = !lastModified ||
      !(parseHttpDate(lastModified) <= parseHttpDate(modifiedSince));

    if (modifiedStale) {
      return false;
    }
  }

  return true;
}

/**
 * Parse an HTTP Date into a number.
 *
 * @param {string} date
 * @returns {number}
 * @private
 */
export function parseHttpDate(date: any): number {
  const timestamp = date && Date.parse(date);

  return typeof timestamp === "number" ? timestamp : NaN;
}

/**
 * Parse a HTTP token list.
 *
 * @param {string} str
 * @private
 */
export function parseTokenList(str: string): any[] {
  const list = [];
  let start = 0;
  let end = 0;

  // gather tokens
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str.charCodeAt(i)) {
      case 0x20:/*   */
        if (start === end) {
          start = end = i + 1;
        }
        break;
      case 0x2c:/* , */
        list.push(str.substring(start, end));
        start = end = i + 1;
        break;
      default:
        end = i + 1;
        break;
    }
  }

  // final token
  list.push(str.substring(start, end));

  return list;
}
