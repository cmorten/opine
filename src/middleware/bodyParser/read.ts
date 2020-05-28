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
