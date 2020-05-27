/*!
 * Adapted body-parser for Deno.
 *
 * REF: https://github.com/expressjs/body-parser/blob/master/lib/types/json.js
 *
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { createHttpError } from "../../../deps.ts";
import { read } from "./read.ts";
import { getCharset } from "./getCharset.ts";
import { typeChecker } from "./typeChecker.ts";
import { hasBody } from "./hasBody.ts";
import { Request, Response, NextFunction } from "../../types.ts";

/**
 * RegExp to match the first non-space in a string.
 *
 * Allowed whitespace is defined in RFC 7159:
 *
 *    ws = *(
 *            %x20 /              ; Space
 *            %x09 /              ; Horizontal tab
 *            %x0A /              ; Line feed or New line
 *            %x0D )              ; Carriage return
 */

const FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*(.)/; // eslint-disable-line no-control-regex

/**
 * Create a middleware to parse JSON bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */
export function json(options: any = {}) {
  const inflate = options.inflate !== false;
  const reviver = options.reviver;
  const strict = options.strict !== false;
  const type = options.type || "application/json";
  const verify = options.verify || false;

  if (verify !== false && typeof verify !== "function") {
    throw new TypeError("option verify must be function");
  }

  // create the appropriate type checking function
  const shouldParse = typeof type !== "function" ? typeChecker(type) : type;

  function parse(buf: string) {
    if (buf.length === 0) {
      // special-case empty json body, as it's a common client-side mistake
      return {};
    }

    if (strict) {
      const first = firstChar(buf);

      if (first !== "{" && first !== "[") {
        throw createStrictSyntaxError(buf, first);
      }
    }

    try {
      return JSON.parse(buf, reviver);
    } catch (e) {
      throw normalizeJsonSyntaxError(e, {
        message: e.message,
        stack: e.stack,
      });
    }
  }

  return async function jsonParser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if ((req as any)._isParsed) {
      next();
      return;
    }

    // skip requests without bodies
    if (!hasBody(req)) {
      req.parsedBody = {};
      next();
      return;
    }

    // determine if request should be parsed
    if (!shouldParse(req)) {
      next();
      return;
    }

    // assert charset per RFC 7159 sec 8.1
    const charset = getCharset(req) || "utf-8";
    if (charset.substr(0, 4) !== "utf-") {
      next(
        createHttpError(
          415,
          'unsupported charset "' + charset.toUpperCase() + '"',
        ),
      );
      return;
    }

    // read
    await read(req, res, next, parse, {
      encoding: charset,
      inflate: inflate,
      verify: verify,
    });
  };
}

/**
 * Create strict violation syntax error matching native error.
 *
 * @param {string} str
 * @param {string} char
 * @return {Error}
 * @private
 */

function createStrictSyntaxError(str: string, char: string) {
  const index = str.indexOf(char);
  const partial = str.substring(0, index) + "#";

  try {
    JSON.parse(partial); /* istanbul ignore next */
    throw new SyntaxError("strict violation");
  } catch (e) {
    return normalizeJsonSyntaxError(e, {
      message: e.message.replace("#", char),
      stack: e.stack,
    });
  }
}

/**
 * Get the first non-whitespace character in a string.
 *
 * @param {string} str
 * @return {function}
 * @private
 */
function firstChar(str: string) {
  return (FIRST_CHAR_REGEXP.exec(str) as any[])[1];
}

/**
 * Normalize a SyntaxError for JSON.parse.
 *
 * @param {SyntaxError} error
 * @param {object} obj
 * @return {SyntaxError}
 */
function normalizeJsonSyntaxError(error: any, obj: any) {
  const keys = Object.getOwnPropertyNames(error);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== "stack" && key !== "message") {
      delete error[key];
    }
  }

  // replace stack before message for Node.js 0.10 and below
  error.stack = obj.stack.replace(error.message, obj.message);
  error.message = obj.message;

  return error;
}
