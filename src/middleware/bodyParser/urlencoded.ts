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

import { createError } from "../../../deps.ts";
import { read } from "./read.ts";
import { getCharset } from "./getCharset.ts";
import type { NextFunction, Request, Response } from "../../types.ts";
import { hasBody, qs } from "../../../deps.ts";
import { typeChecker } from "./typeChecker.ts";

/**
 * Create a middleware to parse urlencoded bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */
export function urlencoded(options: any = {}) {
  const extended = options.extended !== false;
  const inflate = options.inflate !== false;
  const type = options.type || "application/x-www-form-urlencoded";
  const verify = options.verify || false;

  if (verify !== false && typeof verify !== "function") {
    throw new TypeError("option verify must be function");
  }

  const queryParse = extended ? extendedParser(options) : simpleParser(options);

  // create the appropriate type checking function
  const shouldParse = typeof type !== "function" ? typeChecker(type) : type;

  function parse(body: string) {
    return body.length ? queryParse(body) : {};
  }

  return function urlencodedParser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (req._parsedBody) {
      next();

      return;
    }

    // skip requests without bodies
    if (
      !hasBody(req.headers) ||
      parseInt(req.headers.get("content-length") || "") === 0
    ) {
      req.parsedBody = Object.fromEntries(
        new URLSearchParams().entries(),
      );
      next();

      return;
    }

    // determine if request should be parsed
    if (!shouldParse(req)) {
      next();

      return;
    }

    // assert charset
    const charset = getCharset(req) || "utf-8";
    if (charset !== "utf-8") {
      next(
        createError(
          415,
          'unsupported charset "' + charset.toUpperCase() + '"',
        ),
      );

      return;
    }

    // read
    read(req, res, next, parse, {
      encoding: charset,
      inflate: inflate,
      verify: verify,
    });
  };
}

/**
 * Get the simple query parser.
 *
 * @param {object} options
 * @private
 */
function simpleParser(options: any) {
  let parameterLimit = options.parameterLimit !== undefined
    ? options.parameterLimit
    : 1000;

  if (isNaN(parameterLimit) || parameterLimit < 1) {
    throw new TypeError("option parameterLimit must be a positive number");
  }

  if (isFinite(parameterLimit)) {
    parameterLimit = parameterLimit | 0;
  }

  return function queryParse(body: string) {
    const decodedBody = decode(body);
    const paramCount = parameterCount(decodedBody, parameterLimit);

    if (paramCount === undefined) {
      throw createError(413, "too many parameters", {
        type: "parameters.too.many",
      });
    }

    return Object.fromEntries(
      new URLSearchParams(decodedBody)
        .entries(),
    );
  };
}

/**
 * Get the extended query parser.
 *
 * @param {object} options
 * @private
 */
function extendedParser(options: any) {
  let parameterLimit = options.parameterLimit !== undefined
    ? options.parameterLimit
    : 1000;

  if (isNaN(parameterLimit) || parameterLimit < 1) {
    throw new TypeError("option parameterLimit must be a positive number");
  }

  if (isFinite(parameterLimit)) {
    parameterLimit = parameterLimit | 0;
  }

  return function queryParse(body: string) {
    const decodedBody = decode(body);
    const paramCount = parameterCount(decodedBody, parameterLimit);

    if (paramCount === undefined) {
      throw createError(413, "too many parameters", {
        type: "parameters.too.many",
      });
    }

    const arrayLimit = Math.max(100, paramCount);

    return qs.parse(decodedBody, {
      allowPrototypes: true,
      arrayLimit,
      depth: Infinity,
      parameterLimit,
    });
  };
}

/**
 * Count the number of parameters, stopping once limit reached
 *
 * @param {string} body
 * @param {number} limit
 * @private
 */
function parameterCount(body: string, limit: number) {
  let count = 0;
  let index = 0;

  while ((index = body.indexOf("&", index)) !== -1) {
    count++;
    index++;

    if (count === limit) {
      return undefined;
    }
  }

  return count;
}

/**
 * URI decode a string
 * 
 * @param {string} str 
 * @returns {string} decoded string
 * @private
 */
function decode(str: string): string {
  return decodeURIComponent(str.replace(/\+/g, " "));
}
