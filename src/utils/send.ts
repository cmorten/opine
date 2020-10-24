/**
 * Heavily inspired by send (https://github.com/pillarjs/send/tree/0.17.1)
 * 
 * send is licensed as follows:
 * 
 * (The MIT License)
 * 
 * Copyright (c) 2012 TJ Holowaychuk
 * Copyright (c) 2014-2016 Douglas Christopher Wilson
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

import {
  createError,
  extname,
  join,
  ms,
  normalize,
  resolve,
  sep,
} from "../../deps.ts";
import type { Request, Response } from "../types.ts";
import { parseHttpDate, parseTokenList } from "./fresh.ts";

/**
 * Regular expression for identifying a bytes Range header.
 * @private
 */
const BYTES_RANGE_REGEXP = /^ *bytes=/;

/**
 * Maximum value allowed for the max age.
 * @private
 */
const MAX_MAXAGE = 60 * 60 * 24 * 365 * 1000; // 1 year

/**
 * Regular expression to match a path with a directory up component.
 * @private
 */
const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;

const ENOENT = "No such file or directory (os error 2)";
const ENAMETOOLONG = "File name too long (os error 63)";

/**
 * Normalize the index option into an array.
 *
 * @param {boolean|string|array} value
 * @param {string} name
 * @private
 */
function normalizeList(
  value: false | string | string[],
  name: string,
): string[] {
  const list = value === false ? [] : Array.isArray(value) ? value : [value];

  for (let i = 0; i < list.length; i++) {
    if (typeof list[i] !== "string") {
      throw new TypeError(name + " must be array of strings or false");
    }
  }

  return list;
}

/**
 * Determine if path parts contain a dotfile.
 *
 * @private
 */
function containsDotFile(parts: string[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.length > 1 && part[0] === ".") {
      return true;
    }
  }

  return false;
}

/**
 * Check if the pathname ends with "/".
 *
 * @param {string} path
 * @return {boolean}
 * @private
 */
function hasTrailingSlash(path: string): boolean {
  return path[path.length - 1] === "/";
}

/**
 * Check if this is a conditional GET request.
 *
 * @return {boolean}
 * @private
 */
function isConditionalGET(req: Request): boolean {
  return Boolean(
    req.headers.get("if-match") ||
      req.headers.get("if-unmodified-since") ||
      req.headers.get("if-none-match") ||
      req.headers.get("if-modified-since"),
  );
}

/**
 * Check if the request preconditions failed.
 *
 * @return {boolean}
 * @private
 */
function isPreconditionFailure(req: Request, res: Response): boolean {
  // if-match
  const match = req.headers.get("if-match");

  if (match) {
    const etag = res.get("ETag");

    return !etag ||
      (match !== "*" && parseTokenList(match).every(function (match) {
        return match !== etag && match !== "W/" + etag && "W/" + match !== etag;
      }));
  }

  // if-unmodified-since
  const unmodifiedSince = parseHttpDate(req.get("if-unmodified-since"));

  if (!isNaN(unmodifiedSince)) {
    const lastModified = parseHttpDate(res.get("Last-Modified"));

    return isNaN(lastModified) || lastModified > unmodifiedSince;
  }

  return false;
}

/**
 * Create a Content-Range header.
 *
 * @param {string} type
 * @param {number} size
 * @param {array} [range]
 * @private
 */

function contentRange(type: string, size: number, range?: any): string {
  return type + " " + (range ? range.start + "-" + range.end : "*") + "/" +
    size;
}

/**
 * Strip content-* header fields.
 *
 * @private
 */
function removeContentHeaderFields(res: Response): void {
  const headers: string[] = Array.from(res.headers?.keys() ?? []);

  for (const header of headers) {
    if (header.substr(0, 8) === "content-" && header !== "content-location") {
      res.unset(header);
    }
  }
}

/**
 * Check if the request is cacheable, aka
 * responded with 2xx or 304 (see RFC 2616 section 14.2{5,6}).
 *
 * @return {boolean}
 * @private
 */
function isCachable(statusCode: number): boolean {
  return (statusCode >= 200 && statusCode < 300) ||
    statusCode === 304;
}

/**
 * Check if the range is fresh.
 *
 * @return {boolean}
 * @private
 */
function isRangeFresh(req: Request, res: Response): boolean {
  const ifRange = req.get("if-range");

  if (!ifRange) {
    return true;
  }

  // if-range as etag
  if (ifRange.indexOf('"') !== -1) {
    const etag = res.get("ETag");

    return Boolean(etag && ifRange.indexOf(etag) !== -1);
  }

  // if-range as modified date
  const lastModified = res.get("Last-Modified");

  return parseHttpDate(lastModified) <= parseHttpDate(ifRange);
}

/**
 * Collapse all leading slashes into a single slash
 *
 * @param {string} str
 * @private
 */
function collapseLeadingSlashes(str: string) {
  for (var i = 0; i < str.length; i++) {
    if (str[i] !== "/") {
      break;
    }
  }

  return i > 1 ? "/" + str.substr(i) : str;
}

/**
 * Clear all headers from a response.
 *
 * @param {object} res
 * @private
 */
function clearHeaders(res: Response) {
  const headers = Array.from(res.headers?.keys() ?? []);

  for (const header of headers) {
    res.unset(header);
  }
}

/**
 * Emit errors.
 *
 * @param {object} res
 * @param {Error} [error]
 * @private
 */
export function sendError(res: Response, error?: Error): void {
  clearHeaders(res);

  if ((error as any)?.headers) {
    res.set((error as any).headers);
  }

  if (!error) {
    throw createError(
      404,
      new Deno.errors.NotFound().message,
      { code: "ENOENT" },
    );
  } else if (error.message === ENOENT) {
    throw createError(404, error.message, { code: "ENOENT" });
  } else if (error.message === ENAMETOOLONG) {
    throw createError(404, error.message, { code: "ENAMETOOLONG" });
  }

  throw createError(
    (error as any).status ?? 500,
    error.message,
    { code: (error as any).code },
  );
}

/**
 * Transfer the file at `path`.
 * 
 * @param {object} res 
 * @param {string} path 
 * @param {object} options 
 * @param {object} stat 
 */
async function _send(
  res: Response,
  path: string,
  options: any,
  stat: Deno.FileInfo,
) {
  if (res.written) {
    sendError(res, createError(500, "Response already written"));
  }

  const cacheControl = Boolean(options.cacheControl ?? true);

  if (cacheControl && !res.get("Cache-Control")) {
    let maxage = options.maxAge ?? options.maxage;
    maxage = typeof maxage === "string" ? ms(maxage, {}) : Number(maxage);
    maxage = !isNaN(maxage) ? Math.min(Math.max(0, maxage), MAX_MAXAGE) : 0;

    let cacheControlHeader = "public, max-age=" + Math.floor(maxage / 1000);

    const immutable = Boolean(options.immutable ?? false);

    if (immutable) {
      cacheControlHeader += ", immutable";
    }

    res.set("Cache-Control", cacheControlHeader);
  }

  const lastModified = Boolean(options.lastModified ?? true);

  if (lastModified && !res.get("Last-Modified") && stat.mtime) {
    res.set("Last-Modified", stat.mtime.toUTCString());
  }

  const etag = Boolean(options.etag ?? true);

  if (etag && !res.get("ETag")) {
    res.etag(stat);
  }

  if (!res.get("Content-Type")) {
    res.type(extname(path));
  }

  const acceptRanges = Boolean(options.acceptRanges ?? true);

  if (acceptRanges && !res.get("Accept-Ranges")) {
    res.set("Accept-Ranges", "bytes");
  }

  const req = res.req as Request;

  // Conditional GET support
  if (isConditionalGET(req)) {
    if (isPreconditionFailure(req, res)) {
      return sendError(res, createError(412));
    }

    if (isCachable(res.status as number) && req.fresh) {
      removeContentHeaderFields(res);
      res.status = 304;

      return await res.end();
    }
  }

  // Adjust len to start/end options
  let offset: number = options.start ?? 0;
  let len: number = stat.size;
  len = Math.max(0, len - offset);

  if (options.end !== undefined) {
    const bytes = options.end - offset + 1;

    if (len > bytes) {
      len = bytes;
    }
  }

  const rangeHeader = req.headers.get("range") as string;

  // Range support
  if (acceptRanges && BYTES_RANGE_REGEXP.test(rangeHeader)) {
    // parse
    let range = req.range(len, {
      combine: true,
    });

    // If-Range support
    if (!isRangeFresh(req, res)) {
      range = -2;
    }

    // unsatisfiable
    if (range === -1) {
      // Content-Range
      res.set("Content-Range", contentRange("bytes", len));

      // 416 Requested Range Not Satisfiable
      return sendError(
        res,
        createError(416, undefined, {
          headers: { "Content-Range": res.get("Content-Range") },
        }),
      );
    }

    // Valid (syntactically invalid/multiple ranges are treated as a regular response)
    if (range !== -2 && range?.length === 1) {
      // Content-Range
      res.setStatus(206);
      res.set("Content-Range", contentRange("bytes", len, range[0]));

      // adjust for requested range
      offset += range[0].start;
      len = range[0].end - range[0].start + 1;
    }
  }

  // Set read options
  const file = await Deno.open(path, { read: true });
  res.addResource(file.rid);
  await file.seek(offset, Deno.SeekMode.Start);

  // content-length
  res.set("Content-Length", len + "");

  return await res.send(file);
}

async function sendIndex(
  res: Response,
  path: string,
  options: any,
  index: string[],
) {
  let error: Error | undefined;

  for (const i of index) {
    const pathUsingIndex = join(path, i);

    try {
      const stat = await Deno.stat(pathUsingIndex);

      if (!stat.isDirectory) {
        return await _send(res, pathUsingIndex, options, stat);
      }
    } catch (err) {
      error = err;
    }
  }

  return sendError(res, error);
}

async function sendExtension(
  res: Response,
  path: string,
  options: any,
) {
  let error: Error | undefined;

  const extensions = options.extensions !== undefined
    ? normalizeList(options.extensions, "extensions option")
    : [];

  for (const extension of extensions) {
    const pathUsingExtension = `${path}.${extension}`;

    try {
      const stat = await Deno.stat(pathUsingExtension);

      if (!stat.isDirectory) {
        return await _send(res, pathUsingExtension, options, stat);
      }
    } catch (err) {
      error = err;
    }
  }

  return sendError(res, error);
}

async function sendFile(
  res: Response,
  path: string,
  options: any,
) {
  try {
    const stat = await Deno.stat(path);

    if (!stat.isDirectory) {
      return await _send(res, path, options, stat);
    }

    if (hasTrailingSlash(path)) {
      return sendError(res, createError(403));
    }

    res.set("Content-Type", "text/html; charset=UTF-8");
    res.set("Content-Security-Policy", "default-src 'none'");
    res.set("X-Content-Type-Options", "nosniff");

    return res.redirect(301, collapseLeadingSlashes(path + "/"));
  } catch (err) {
    if (
      err.message === ENOENT && !extname(path) &&
      path[path.length - 1] !== sep
    ) {
      return await sendExtension(res, path, options);
    }

    return sendError(res, err);
  }
}

export async function send<T = Response<any>>(
  res: T,
  path: string,
  options: any,
): Promise<T | void>;
export async function send(
  res: Response,
  path: string,
  options: any,
) {
  // null byte(s)
  if (~path.indexOf("\0")) {
    sendError(res, createError(400));
  }

  const root = options.root ? resolve(options.root) : null;

  let parts;
  if (root !== null) {
    // normalize
    if (path) {
      path = normalize("." + sep + path);
    }

    // malicious path
    if (UP_PATH_REGEXP.test(path)) {
      sendError(res, createError(403));
    }

    // explode path parts
    parts = path.split(sep);

    // join / normalize from optional root dir
    path = normalize(join(root, path));
  } else {
    // ".." is malicious without "root"
    if (UP_PATH_REGEXP.test(path)) {
      sendError(res, createError(403));
    }

    // explode path parts
    parts = normalize(path).split(sep);

    // resolve the path
    path = normalize(path);
  }

  // dotfile handling
  if (containsDotFile(parts)) {
    const dotfiles = options.dotfiles ?? "ignore";

    if (dotfiles !== "ignore" && dotfiles !== "allow" && dotfiles !== "deny") {
      sendError(
        res,
        new TypeError(
          'dotfiles option must be "allow", "deny", or "ignore"',
        ),
      );
    }

    switch (dotfiles) {
      case "allow":
        break;
      case "deny":
        sendError(res, createError(403));
      case "ignore":
      default:
        sendError(res, createError(404));
    }
  }

  const index = options.index !== undefined
    ? normalizeList(options.index, "index option")
    : ["index.html"];

  if (index.length && hasTrailingSlash(path)) {
    return await sendIndex(res, path, options, index);
  }

  return await sendFile(res, path, options);
}
