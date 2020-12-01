import { qs } from "../../deps.ts";
import { parseUrl } from "../utils/parseUrl.ts";
import { merge } from "../utils/merge.ts";
import type { NextFunction, Request, Response } from "../types.ts";

/**
 * Exposes a query object containing the querystring
 * parameters of the request url.
 * 
 * @return {Function} query middleware
 * @public
 */
export const query = function (options: any) {
  let opts = merge({}, options);
  let queryParse = qs.parse;

  if (typeof options === "function") {
    queryParse = options;
    opts = undefined;
  }

  if (opts !== undefined && opts.allowPrototypes === undefined) {
    // back-compat for qs module
    opts.allowPrototypes = true;
  }

  return function opineQuery(req: Request, _res: Response, next: NextFunction) {
    if (!req.query) {
      const value = parseUrl(req)?.query as string;
      req.query = queryParse(value, opts);
    }

    next();
  };
};
