/**
 * Port of forwarded (https://github.com/jshttp/forwarded/tree/v0.1.2) for Deno.
 * 
 * Licensed as follows:
 * 
 * The MIT License
 * 
 * Copyright (c) 2014-2017 Douglas Christopher Wilson
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

import type { ServerRequest } from "../../deps.ts";

/**
 * Get all addresses in the request, using the `X-Forwarded-For` header.
 *
 * @param {object} req
 * @return {array}
 * @public
 */
export function forwarded(req: ServerRequest) {
  if (!req) {
    throw new TypeError("argument req is required");
  }

  // simple header parsing
  const proxyAddrs = parse(req.headers.get("x-forwarded-for") ?? "");
  const { hostname: socketAddr } = req.conn.remoteAddr as Deno.NetAddr;
  const addrs = [socketAddr].concat(proxyAddrs);

  // return all addresses
  return addrs;
}

/**
 * Parse the X-Forwarded-For header.
 *
 * @param {string} header
 * @private
 */
function parse(header: string) {
  const list = [];
  let start = header.length;
  let end = header.length;

  // gather addresses, backwards
  for (let i = header.length - 1; i >= 0; i--) {
    switch (header.charCodeAt(i)) {
      case 0x20:/*   */
        if (start === end) {
          start = end = i;
        }

        break;
      case 0x2c:/* , */
        if (start !== end) {
          list.push(header.substring(start, end));
        }
        start = end = i;

        break;
      default:
        start = i;

        break;
    }
  }

  // final address
  if (start !== end) {
    list.push(header.substring(start, end));
  }

  return list;
}
