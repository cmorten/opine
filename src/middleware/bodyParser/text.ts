/*!
 * Port of body-parser (https://github.com/expressjs/body-parser) for Deno.
 *
 * Licensed as follows:
 *
 * (The MIT License)
 * 
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>
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

import { read } from "./read.ts";
import { getCharset } from "./getCharset.ts";
import type { NextFunction, Request, Response } from "../../types.ts";
import { hasBody } from "../../../deps.ts";
import { typeChecker } from "./typeChecker.ts";

/**
 * Create a middleware to parse text bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */
export function text(options: any = {}) {
  const defaultCharset = options.defaultCharset || "utf-8";
  const inflate = options.inflate !== false;
  const type = options.type || "text/plain";
  const verify = options.verify || false;

  if (verify !== false && typeof verify !== "function") {
    throw new TypeError("option verify must be function");
  }

  // create the appropriate type checking function
  const shouldParse = typeof type !== "function" ? typeChecker(type) : type;

  function parse(buf: string) {
    return buf;
  }

  return function textParser(req: Request, res: Response, next: NextFunction) {
    if (req._parsedBody) {
      next();

      return;
    }

    // skip requests without bodies
    if (
      !hasBody(req.headers) ||
      parseInt(req.headers.get("content-length") || "") === 0
    ) {
      req.parsedBody = "";
      next();

      return;
    }

    // determine if request should be parsed
    if (!shouldParse(req)) {
      next();

      return;
    }

    // get charset
    const charset = getCharset(req) || defaultCharset;

    // read
    read(req, res, next, parse, {
      encoding: charset,
      inflate: inflate,
      verify: verify,
    });
  };
}
