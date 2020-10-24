import {
  createError,
  extname,
  join,
  ms,
  normalize,
  resolve,
  sep,
} from "../../deps.ts";
import type { Response } from "../types.ts";

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

async function _send(
  res: Response,
  path: string,
  options: any,
  stats: Deno.FileInfo,
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

  if (lastModified && !res.get("Last-Modified") && stats.mtime) {
    res.set("Last-Modified", stats.mtime.toUTCString());
  }

  const etag = Boolean(options.etag ?? true);

  if (etag && !res.get("ETag")) {
    res.etag(stats);
  }

  if (!res.get("Content-Type")) {
    res.type(extname(path));
  }

  // TODO: stream response
  // TODO: support Accept-Ranges and Content-Range
  const body = await Deno.readFile(path);

  return await res.send(body);
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
      const stats = await Deno.stat(pathUsingIndex);

      if (!stats.isDirectory) {
        return await _send(res, pathUsingIndex, options, stats);
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
      const stats = await Deno.stat(pathUsingExtension);

      if (!stats.isDirectory) {
        return await _send(res, pathUsingExtension, options, stats);
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
    const stats = await Deno.stat(path);

    if (!stats.isDirectory) {
      return await _send(res, path, options, stats);
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
