/*!
 * Adapted body-parser for Deno.
 *
 * REF: https://github.com/expressjs/body-parser/blob/master/lib/types/urlencoded.js
 *
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { createHttpError } from "../../../deps.ts";
import { read } from "./read.ts";
import { getCharset } from "./getCharset.ts";
import { Request, Response, NextFunction } from "../../types.ts";
import { hasBody } from "./hasBody.ts";
import { typeChecker } from "./typeChecker.ts";

/**
 * Create a middleware to parse urlencoded bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */
export function urlencoded(options: any = {}) {
  const inflate = options.inflate !== false;
  const type = options.type || "application/x-www-form-urlencoded";
  const verify = options.verify || false;

  if (verify !== false && typeof verify !== "function") {
    throw new TypeError("option verify must be function");
  }

  // create the appropriate type checking function
  const shouldParse = typeof type !== "function" ? typeChecker(type) : type;

  function parse(buf: string) {
    return buf.length
      ? Object.fromEntries(new URLSearchParams(buf.replace(/\+/g, " ")))
      : {};
  }

  return function urlencodedParser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if ((req as any)._body) {
      next();
      return;
    }

    // skip requests without bodies
    if (!req.body || !hasBody(req)) {
      (req as any).body = Object.fromEntries(new URLSearchParams());
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
        createHttpError(
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
