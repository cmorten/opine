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

import type { NextFunction, Request, Response } from "../../types.ts";
import {
  createError,
  gunzip as createGunzip,
  inflate as createInflate,
} from "../../../deps.ts";

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
  req._parsedBody = true;

  const encoding: string = options.encoding;
  const verify = options.verify;

  let raw: Uint8Array;
  try {
    raw = await decodeContent(req, options.inflate);
  } catch (err) {
    next(err);

    return;
  }

  if (verify) {
    try {
      verify(req, res, raw, encoding);
    } catch (err) {
      next(createError(403, err, {
        body: raw,
        type: err.type ?? "entity.verify.failed",
      }));

      return;
    }
  }

  let str;
  try {
    str = typeof raw !== "string" && encoding !== null
      ? new TextDecoder(encoding).decode(raw)
      : raw;

    req.parsedBody = parse(str);
  } catch (err) {
    next(createError(400, err, {
      body: str ?? raw,
      type: err.type ?? "entity.parse.failed",
    }));

    return;
  }

  next();
}

/**
 * Get the decoded content of the request.
 *
 * @param {object} req
 * @param {boolean} [inflate=true]
 * @return {Promise<Uint8Array>}
 * @private
 */
async function decodeContent(
  req: Request,
  inflate: boolean = true,
): Promise<Uint8Array> {
  const encoding = (req.headers.get("content-encoding") || "identity")
    .toLowerCase();

  if (inflate === false && encoding !== "identity") {
    throw createError(415, `unsupported content encoding "${encoding}"`, {
      encoding: encoding,
      type: "encoding.unsupported",
    });
  }

  let raw;
  try {
    raw = await Deno.readAll(req.body);
  } catch (err) {
    throw createError(400, err);
  }

  switch (encoding) {
    case "deflate":
      return createInflate(raw);
    case "gzip":
      return createGunzip(raw);
    case "identity":
      return raw;
    default:
      throw createError(415, `unsupported content encoding "${encoding}"`, {
        encoding: encoding,
        type: "encoding.unsupported",
      });
  }
}
