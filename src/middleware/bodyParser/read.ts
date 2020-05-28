/*!
 * Adapted body-parser for Deno.
 *
 * REF: https://github.com/expressjs/body-parser/blob/master/lib/read.js
 *
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { Request, Response, NextFunction } from "../../types.ts";
import { createHttpError } from "../../../deps.ts";

const decoder = new TextDecoder();

/**
 * Read a request into a buffer and parse.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @param {Function} parse
 * @param {object} options
 * @private
 */
export async function read(
  req: Request,
  res: Response,
  next: NextFunction,
  parse: Function,
  options: any,
) {
  // flag as parsed
  (req as any)._isParsed = true;

  // read options
  const verify = options.verify;
  const encoding = options.encoding !== null ? options.encoding : null;

  // get the content stream
  let reader: Deno.Reader;
  try {
    reader = getBodyReader(req, options.inflate);
  } catch (err) {
    return next(err);
  }

  let body;
  try {
    const raw = await Deno.readAll(reader);
    body = decoder.decode(raw);
  } catch (err) {
    next(createHttpError(400, err));
  }

  // verify
  if (verify) {
    try {
      verify(req, res, body, encoding);
    } catch (err) {
      next(createHttpError(403, err));
      return;
    }
  }

  // parse
  try {
    req.parsedBody = parse(body);
  } catch (err) {
    next(createHttpError(400, err));
    return;
  }

  next();
}

/**
 * Get the content stream of the request.
 *
 * @param {object} req
 * @param {boolean} [inflate=true]
 * @return {object}
 * @private
 */
function getBodyReader(req: Request, inflate: boolean = true) {
  const encoding = (req.headers.get("content-encoding") || "identity")
    .toLowerCase();

  if (inflate === false && encoding !== "identity") {
    throw createHttpError(
      415,
      'unsupported content encoding "' + encoding + '"',
    );
  }

  // TODO: support deflate and gzip encoding.
  switch (encoding) {
    case "identity":
      return req.body;
    case "deflate":
    case "gzip":
    default:
      throw createHttpError(
        415,
        'unsupported content encoding "' + encoding + '"',
      );
  }
}
