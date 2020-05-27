/*!
 * Adapted body-parser for Deno.
 *
 * REF: https://github.com/expressjs/body-parser/blob/master/lib/types/text.js
 *
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { read } from "./read.ts";
import { getCharset } from "./getCharset.ts";
import { Request, Response, NextFunction } from "../../types.ts";
import { hasBody } from "./hasBody.ts";
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
    if ((req as any)._isParsed) {
      next();
      return;
    }

    // skip requests without bodies
    if (!hasBody(req)) {
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
