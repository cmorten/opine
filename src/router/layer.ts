import { pathToRegexp } from "../utils/pathToRegex.ts";
import type { NextFunction, Request, Response } from "../types.ts";

export const Layer: any = function Layer(
  this: any,
  path: any,
  options: any = {},
  fn: any,
) {
  if (!(this instanceof Layer)) {
    return new (Layer as any)(path, options, fn);
  }

  (this as any).handle = fn;
  (this as any).name = fn.name || "<anonymous>";
  (this as any).params = undefined;
  (this as any).path = undefined;
  (this as any).regexp = pathToRegexp(path, (this as any).keys = [], options);

  // set fast path flags
  (this as any).regexp.fast_star = path === "*";
  (this as any).regexp.fast_slash = path === "/" && options.end === false;
};

/**
 * Handle the error for the layer.
 *
 * @param {Error|string} error
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @private
 */

Layer.prototype.handle_error = async function handle_error(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let fn = this.handle;

  if (fn.length !== 4) {
    // not a standard error handler
    return next(error);
  }

  try {
    await fn(error, req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle the request for the layer.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @private
 */
Layer.prototype.handle_request = async function handle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let fn = this.handle;

  if (fn.length > 3) {
    // not a standard request handler
    return next();
  }

  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @private
 */
Layer.prototype.match = function match(path: any) {
  let match;

  if (path != null) {
    // fast path non-ending match for / (any path matches)
    if (this.regexp.fast_slash) {
      this.params = {};
      this.path = "";
      return true;
    }

    // fast path for * (everything matched in a param)
    if (this.regexp.fast_star) {
      this.params = { "0": decode_param(path) };
      this.path = path;
      return true;
    }

    // match the path
    match = this.regexp.exec(path);
  }

  if (!match) {
    this.params = undefined;
    this.path = undefined;
    return false;
  }

  // store values
  this.params = {};
  this.path = match[0];

  let keys = this.keys;
  let params = this.params;

  for (let i = 1; i < match.length; i++) {
    let key = keys[i - 1];
    let prop = key.name;
    let val = decode_param(match[i]);

    if (
      val !== undefined ||
      !(Object.prototype.hasOwnProperty.call(params, prop))
    ) {
      params[prop] = val;
    }
  }

  return true;
};

/**
 * Decode param value.
 *
 * @param {string} val
 * @return {string}
 * @private
 */
function decode_param(val: any) {
  if (typeof val !== "string" || val.length === 0) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = "Failed to decode param '" + val + "'";
      (err as any).status = 400;
    }

    throw err;
  }
}
