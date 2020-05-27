/*!
 * Adapted body-parser for Deno.
 *
 * REF: https://github.com/expressjs/body-parser/blob/master/lib/types/raw.js
 *
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { read } from "./read.ts";
import { Request, Response, NextFunction } from "../../types.ts";
import { hasBody } from "./hasBody.ts";
import { typeChecker } from "./typeChecker.ts";

/**
 * Create a middleware to parse raw bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */
export function raw(options: any = {}) {
  const inflate = options.inflate !== false;
  const type = options.type || "application/octet-stream";
  const verify = options.verify || false;

  if (verify !== false && typeof verify !== "function") {
    throw new TypeError("option verify must be function");
  }

  // create the appropriate type checking function
  const shouldParse = typeof type !== "function" ? typeChecker(type) : type;

  function parse(body: any) {
    return body;
  }

  return function rawParser(req: Request, res: Response, next: NextFunction) {
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

    // read
    read(req, res, next, parse, {
      encoding: null,
      inflate: inflate,
      verify: verify,
    });
  };
}
